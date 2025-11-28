/**
 * Fix all unused request parameters in API routes
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import path from 'path'

const apiRoutes = glob.sync('frontend/app/api/**/route.ts')

let fixed = 0

for (const filePath of apiRoutes) {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false

  // Fix: request: NextRequest -> _request: NextRequest (when request is not used)
  // Pattern: export async function METHOD(request: NextRequest
  const patterns = [
    // Single line
    /export async function (GET|POST|PATCH|DELETE|PUT)\(\s*request: NextRequest\s*\)/g,
    // Multi-line with params
    /export async function (GET|POST|PATCH|DELETE|PUT)\(\s*request: NextRequest,\s*\n\s*\{/g,
  ]

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      // Check if request is actually used in the function body
      const functionMatch = content.match(new RegExp(`export async function (GET|POST|PATCH|DELETE|PUT)\\(\\s*request: NextRequest[^}]*?\\{([\\s\\S]*?)\\n\\s*\\}`, 'g'))
      
      if (functionMatch) {
        for (const match of functionMatch) {
          // Extract function body
          const bodyMatch = match.match(/\{([\s\S]*)\}/)
          if (bodyMatch) {
            const body = bodyMatch[1]
            // Check if 'request' is used (not just 'request.' or 'request.json()')
            const usesRequest = /\brequest\b/.test(body) && !/\brequest\./.test(body) && !/\brequest\s*\)/.test(body)
            
            if (!usesRequest) {
              content = content.replace(/export async function (GET|POST|PATCH|DELETE|PUT)\(\s*request: NextRequest/g, 'export async function $1(_request: NextRequest')
              modified = true
            }
          }
        }
      } else {
        // Simple case - just replace if pattern matches
        content = content.replace(pattern, (match, method) => {
          return match.replace('request: NextRequest', '_request: NextRequest')
        })
        modified = true
      }
    }
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8')
    console.log(`✅ Fixed: ${filePath}`)
    fixed++
  }
}

console.log(`\n📊 Fixed ${fixed} file(s)`)




