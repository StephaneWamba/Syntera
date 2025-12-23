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
    
    buffer.fill(0)

    // Check extracted text size
    if (extracted.text.length > PROCESSING_CONSTANTS.MAX_TEXT_LENGTH) {
      throw new Error(
        `Extracted text is too large (${(extracted.text.length / 1024 / 1024).toFixed(2)}MB). Maximum allowed: ${PROCESSING_CONSTANTS.MAX_TEXT_LENGTH / 1024 / 1024}MB`
      )
    }

    const chunks = chunkText(extracted.text)

    const chunkTexts = chunks.map(chunk => chunk.text)
    const chunkMetadata = chunks.map(chunk => ({
      index: chunk.index,
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
    }))
    const totalChunks = chunkTexts.length

    chunks.length = 0
    extracted.text = ''
    const BATCH_SIZE = chunkTexts.length > 100 
      ? PROCESSING_CONSTANTS.BATCH_SIZE_LARGE 
      : PROCESSING_CONSTANTS.BATCH_SIZE_SMALL
    let totalVectorsProcessed = 0
    const totalBatches = Math.ceil(chunkTexts.length / BATCH_SIZE)

    for (let i = 0; i < chunkTexts.length; i += BATCH_SIZE) {
      const batchStart = i
      const batchEnd = Math.min(i + BATCH_SIZE, chunkTexts.length)
      const batchSize = batchEnd - batchStart
      
      const batchChunkTexts = chunkTexts.slice(batchStart, batchEnd)
      const batchChunkMetadata = chunkMetadata.slice(batchStart, batchEnd)
      
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      
      const embeddings = await createEmbeddings(batchChunkTexts)

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

      const upsertSuccess = await upsertVectors(batchVectors, document.company_id)
      if (upsertSuccess) {
        totalVectorsProcessed += batchVectors.length
      } else {
        logger.warn(`Skipped vector storage for batch ${batchNumber} (Pinecone not available)`)
      }
      
      batchVectors.length = 0
      embeddings.length = 0
      batchChunkTexts.length = 0
      batchChunkMetadata.length = 0
      
      if (global.gc && batchNumber % PROCESSING_CONSTANTS.GC_INTERVAL === 0) {
        global.gc()
      }
      
      if (batchNumber < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, PROCESSING_CONSTANTS.BATCH_DELAY_MS))
      }
    }
    chunkTexts.length = 0
    chunkMetadata.length = 0

    await supabase
      .from('knowledge_base_documents')
      .update({
        status: 'completed',
        chunk_count: totalChunks,
        vector_count: totalVectorsProcessed,
        metadata: {
          ...document.metadata,
          extracted: {
            pageCount: extracted.metadata.pageCount,
            wordCount: extracted.metadata.wordCount,
            characterCount: extracted.metadata.characterCount,
          },
        },
        processed_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', documentId)
}

export function initializeProcessor() {
  initializeOpenAI()
}

