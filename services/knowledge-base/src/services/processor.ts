/**
 * Document Processor
 * Processes documents from the queue: extracts text, chunks, creates embeddings, stores in Pinecone
 */

import { createLogger } from '@syntera/shared/logger/index.js'
import { getSupabase } from '../config/database.js'
import { extractText } from './extractor.js'
import { chunkText } from './chunker.js'
import { createEmbeddings, initializeOpenAI } from './embeddings.js'
import { upsertVectors, deleteVectors } from './pinecone.js'
import { PROCESSING_CONSTANTS } from '../config/constants.js'

/**
 * Find the nearest sentence boundary around the given index
 * Helper function for window processing
 */
function findSentenceBoundary(text: string, index: number): number {
  const sentenceEndings = ['. ', '.\n', '! ', '!\n', '? ', '?\n']
  let bestIndex = index

  // Look backwards (prefer earlier boundary)
  for (let i = index; i > index - 500 && i >= 0; i--) {
    for (const ending of sentenceEndings) {
      if (text.slice(i, i + ending.length) === ending) {
        return i + ending.length
      }
    }
  }

  // Look forwards if no backward match found
  for (let i = index; i < index + 500 && i < text.length; i++) {
    for (const ending of sentenceEndings) {
      if (text.slice(i, i + ending.length) === ending) {
        return i + ending.length
      }
    }
  }

  return bestIndex
}

const logger = createLogger('knowledge-base-service:processor')

export async function processDocument(documentId: string) {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Document processing timeout after ${PROCESSING_CONSTANTS.TIMEOUT_MS / 1000} seconds`))
    }, PROCESSING_CONSTANTS.TIMEOUT_MS)
  })
  
  try {
    await Promise.race([
      processDocumentInternal(documentId),
      timeoutPromise,
    ])
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`Failed to process document ${documentId}`, { 
      error: errorMessage
    })

    try {
      const supabase = getSupabase()
      await supabase
        .from('knowledge_base_documents')
        .update({
          status: 'failed',
          metadata: {
            error: errorMessage,
            failed_at: new Date().toISOString(),
          },
        } as Record<string, unknown>)
        .eq('id', documentId)
    } catch (updateError) {
      logger.error(`Failed to update document status to failed for ${documentId}`, { error: updateError })
    }
    throw error
  }
}

async function processDocumentInternal(documentId: string) {
  const supabase = getSupabase()

    await supabase
      .from('knowledge_base_documents')
      .update({ status: 'processing' } as Record<string, unknown>)
      .eq('id', documentId)

    // Fetch document metadata
    interface DocumentRow {
      id: string
      file_size?: number
      file_path?: string
      mime_type?: string
      file_type?: string
      company_id: string
      agent_id?: string
      name?: string
      metadata?: Record<string, unknown>
      [key: string]: unknown
    }
    
    const { data: document, error: docError } = await supabase
      .from('knowledge_base_documents')
      .select('*')
      .eq('id', documentId)
      .single<DocumentRow>()

    if (docError || !document) {
      throw new Error(`Document not found: ${documentId}`)
    }

    // Check file size before processing
    if (document.file_size && document.file_size > PROCESSING_CONSTANTS.MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File size (${(document.file_size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${PROCESSING_CONSTANTS.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)`
      )
    }

    // Download file from Supabase Storage
    if (!document.file_path) {
      throw new Error('Document file_path is missing')
    }
    
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`)
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const extracted = await extractText(buffer, document.mime_type || document.file_type || '')
    
    // Clear buffer immediately after extraction to free memory
    buffer.fill(0)
    // Note: arrayBuffer will be GC'd after buffer is cleared

    // Check extracted text size
    if (extracted.text.length > PROCESSING_CONSTANTS.MAX_TEXT_LENGTH) {
      throw new Error(
        `Extracted text is too large (${(extracted.text.length / 1024 / 1024).toFixed(2)}MB). Maximum allowed: ${PROCESSING_CONSTANTS.MAX_TEXT_LENGTH / 1024 / 1024}MB`
      )
    }

    // Process chunks incrementally to avoid memory issues
    // Instead of creating all chunks upfront, process in windows
    const WINDOW_SIZE = 200 // Process ~200 chunks at a time (200KB of text)
    const EMBEDDING_BATCH_SIZE = document.file_size && document.file_size > 5 * 1024 * 1024
      ? PROCESSING_CONSTANTS.BATCH_SIZE_LARGE // Large files: smaller batches
      : PROCESSING_CONSTANTS.BATCH_SIZE_SMALL // Small files: larger batches
    
    let totalChunks = 0
    let totalVectorsProcessed = 0
    let globalChunkIndex = 0
    const text = extracted.text
    const textLength = text.length
    
    // Save metadata before processing (text will be processed incrementally)
    const extractedMetadata = { ...extracted.metadata }

    // Process text in windows to avoid loading all chunks into memory
    let windowStart = 0
    let windowNumber = 0

    while (windowStart < textLength) {
      windowNumber++
      
      // Calculate window end (process WINDOW_SIZE chunks worth of text)
      // Approximate: each chunk is ~1000 chars, so window is ~WINDOW_SIZE * 1000 chars
      const estimatedWindowSize = WINDOW_SIZE * 1000
      let windowEnd = Math.min(windowStart + estimatedWindowSize, textLength)
      
      // Extend window to end at a natural boundary (sentence end)
      if (windowEnd < textLength) {
        const sentenceEnd = findSentenceBoundary(text, windowEnd)
        if (sentenceEnd > windowStart) {
          windowEnd = sentenceEnd
        }
      }

      // Extract window text
      const windowText = text.slice(windowStart, windowEnd)
      
      // Chunk this window
      const windowChunks = chunkText(windowText, 1000, 200)
      
      // Adjust chunk indices to be global
      const adjustedChunks = windowChunks.map((chunk, idx) => ({
        ...chunk,
        index: globalChunkIndex + idx,
        startIndex: windowStart + chunk.startIndex,
        endIndex: windowStart + chunk.endIndex,
      }))
      
      globalChunkIndex += adjustedChunks.length
      totalChunks += adjustedChunks.length
      
      // Process this window's chunks in embedding batches
      const windowChunkTexts = adjustedChunks.map(chunk => chunk.text)
      const windowChunkMetadata = adjustedChunks.map(chunk => ({
        index: chunk.index,
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
      }))
      
      // Clear chunks array immediately
      adjustedChunks.length = 0
      windowChunks.length = 0
      
      // Process window chunks in embedding batches
      for (let i = 0; i < windowChunkTexts.length; i += EMBEDDING_BATCH_SIZE) {
        const batchStart = i
        const batchEnd = Math.min(i + EMBEDDING_BATCH_SIZE, windowChunkTexts.length)
        
        const batchChunkTexts = windowChunkTexts.slice(batchStart, batchEnd)
        const batchChunkMetadata = windowChunkMetadata.slice(batchStart, batchEnd)
        
        const batchNumber = Math.floor(i / EMBEDDING_BATCH_SIZE) + 1
        
        // Create embeddings for this batch
        const embeddings = await createEmbeddings(batchChunkTexts)

        // Create vectors
        const batchVectors = batchChunkMetadata.map((meta, batchIndex) => ({
          id: `${documentId}-chunk-${meta.index}`,
          values: embeddings[batchIndex],
          metadata: {
            document_id: documentId,
            company_id: document.company_id,
            agent_id: document.agent_id || '',
            chunk_index: meta.index,
            start_index: meta.startIndex,
            end_index: meta.endIndex,
            file_name: document.name || '',
            // CRITICAL: Store the actual chunk text in metadata so it can be retrieved during search
            text: batchChunkTexts[batchIndex],
          },
        }))

        // Upsert to Pinecone
        const upsertSuccess = await upsertVectors(batchVectors, document.company_id)
        if (upsertSuccess) {
          totalVectorsProcessed += batchVectors.length
        } else {
          logger.warn(`Skipped vector storage for batch (Pinecone not available)`, {
            window: windowNumber,
            batch: batchNumber,
          })
        }
        
        // Clear batch data immediately
        batchVectors.length = 0
        embeddings.length = 0
        batchChunkTexts.length = 0
        batchChunkMetadata.length = 0
      }
      
      // Clear window data immediately
      windowChunkTexts.length = 0
      windowChunkMetadata.length = 0
      // windowText will be GC'd as it goes out of scope
      
      // Move to next window
      windowStart = windowEnd
      
      // Force GC every few windows for large documents
      if (global.gc && windowNumber % 5 === 0) {
        global.gc()
        logger.debug(`Forced GC after processing window ${windowNumber}`, {
          totalChunks,
          windowNumber,
        })
      }
      
      // Small delay to prevent overwhelming the system
      if (windowStart < textLength) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    // Text will be GC'd when function exits
    logger.info(`Completed processing document in ${windowNumber} windows`, {
      documentId,
      totalChunks,
      totalVectorsProcessed,
    })

    await supabase
      .from('knowledge_base_documents')
      .update({
        status: 'completed',
        chunk_count: totalChunks,
        vector_count: totalVectorsProcessed,
        metadata: {
          ...document.metadata,
          extracted: {
            pageCount: extractedMetadata.pageCount,
            wordCount: extractedMetadata.wordCount,
            characterCount: extractedMetadata.characterCount,
          },
        },
        processed_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', documentId)
}

export function initializeProcessor() {
  initializeOpenAI()
}

