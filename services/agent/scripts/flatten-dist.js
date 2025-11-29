/**
 * Post-build script to flatten TypeScript output structure
 * Moves files from dist/services/agent/src/ to dist/
 * Rewrites @syntera/shared imports to relative paths
 */

import { readdir, stat, copyFile, mkdir, rm, readFile, writeFile } from 'fs/promises'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const distRoot = join(__dirname, '..', 'dist')
const nestedPath = join(distRoot, 'services', 'agent', 'src')
const sharedDistPath = join(__dirname, '..', '..', '..', 'shared', 'dist')

/**
 * Rewrite @syntera/shared imports to relative paths
 */
async function rewriteImports(filePath) {
  const content = await readFile(filePath, 'utf-8')
  
  // Calculate relative path from this file to shared/dist
  const fileDir = dirname(filePath)
  const relativeToShared = relative(fileDir, sharedDistPath)
  
  // Replace @syntera/shared/* imports with relative paths
  // Handles both: import ... from '@syntera/shared/...' and import('@syntera/shared/...')
  let rewritten = content.replace(
    /from ['"]@syntera\/shared\/([^'"]+)['"]/g,
    (match, importPath) => {
      // Convert @syntera/shared/logger/index.js -> ../../shared/dist/logger/index.js
      const relativePath = join(relativeToShared, importPath).replace(/\\/g, '/')
      return `from '${relativePath}'`
    }
  )
  
  // Handle dynamic imports: import('@syntera/shared/...')
  rewritten = rewritten.replace(
    /import\(['"]@syntera\/shared\/([^'"]+)['"]\)/g,
    (match, importPath) => {
      const relativePath = join(relativeToShared, importPath).replace(/\\/g, '/')
      return `import('${relativePath}')`
    }
  )
  
  // Handle require-style (if any): require('@syntera/shared/...')
  rewritten = rewritten.replace(
    /require\(['"]@syntera\/shared\/([^'"]+)['"]\)/g,
    (match, importPath) => {
      const relativePath = join(relativeToShared, importPath).replace(/\\/g, '/')
      return `require('${relativePath}')`
    }
  )
  
  if (rewritten !== content) {
    await writeFile(filePath, rewritten, 'utf-8')
  }
}

async function flattenDist() {
  try {
    // Check if nested structure exists
    try {
      await stat(nestedPath)
    } catch {
      console.log('No nested structure found, dist is already flat')
      return
    }

    console.log('Flattening dist structure...')
    console.log(`Source: ${nestedPath}`)
    console.log(`Target: ${distRoot}`)

    // Copy all files from nested structure to root
    async function copyRecursive(src, dest) {
      const entries = await readdir(src, { withFileTypes: true })

      for (const entry of entries) {
        const srcPath = join(src, entry.name)
        const destPath = join(dest, entry.name)

        if (entry.isDirectory()) {
          await mkdir(destPath, { recursive: true })
          await copyRecursive(srcPath, destPath)
        } else {
          // Ensure destination directory exists
          await mkdir(dirname(destPath), { recursive: true })
          await copyFile(srcPath, destPath)
          
          // Rewrite imports in JS files
          if (entry.name.endsWith('.js')) {
            await rewriteImports(destPath)
          }
        }
      }
    }

    // Copy files from nested structure to dist root
    await copyRecursive(nestedPath, distRoot)

    // Remove nested structure (only the TypeScript output directories, not our copied files)
    console.log('Removing nested structure...')
    // Remove dist/services/agent/ (the nested TypeScript output)
    // But keep dist/services/ (our actual service files that we just copied)
    const nestedServicesAgentPath = join(distRoot, 'services', 'agent')
    try {
      await rm(nestedServicesAgentPath, { recursive: true, force: true })
    } catch (error) {
      // Ignore if already removed
    }
    // Remove dist/shared/ (if TypeScript copied it, but we use the actual shared/dist)
    const nestedSharedPath = join(distRoot, 'shared')
    try {
      await stat(nestedSharedPath)
      // Only remove if it's the nested TypeScript output, not if it's our copied files
      // Check if it contains 'src' subdirectory (TypeScript output structure)
      try {
        await stat(join(nestedSharedPath, 'src'))
        await rm(nestedSharedPath, { recursive: true, force: true })
      } catch {
        // No 'src' subdirectory, so it might be our copied files - don't remove
      }
    } catch {
      // Directory doesn't exist, ignore
    }

    console.log('✅ Dist structure flattened successfully')
    console.log(`✅ index.js should now be at: ${join(distRoot, 'index.js')}`)
  } catch (error) {
    console.error('❌ Error flattening dist:', error)
    process.exit(1)
  }
}

flattenDist()

