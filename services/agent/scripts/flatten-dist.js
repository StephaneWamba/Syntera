/**
 * Post-build script to flatten TypeScript output structure
 * Moves files from dist/services/agent/src/ to dist/
 */

import { readdir, stat, copyFile, mkdir, rm } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const distRoot = join(__dirname, '..', 'dist')
const nestedPath = join(distRoot, 'services', 'agent', 'src')

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
        }
      }
    }

    // Copy files from nested structure to dist root
    await copyRecursive(nestedPath, distRoot)

    // Remove nested structure
    console.log('Removing nested structure...')
    await rm(join(distRoot, 'services'), { recursive: true, force: true })
    await rm(join(distRoot, 'shared'), { recursive: true, force: true })

    console.log('✅ Dist structure flattened successfully')
    console.log(`✅ index.js should now be at: ${join(distRoot, 'index.js')}`)
  } catch (error) {
    console.error('❌ Error flattening dist:', error)
    process.exit(1)
  }
}

flattenDist()

