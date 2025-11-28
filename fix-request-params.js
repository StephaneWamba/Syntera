/**
 * Fix files where _request is in signature but request is used in body
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

const filesToCheck = [
  'frontend/app/api/crm/deals/route.ts',
  'frontend/app/api/notifications/route.ts',
  'frontend/app/api/workflows/[id]/executions/route.ts',
  'frontend/app/api/workflows/[id]/test/route.ts',
  'frontend/app/api/workflows/[id]/route.ts',
  'frontend/app/api/workflows/route.ts',
  'frontend/app/api/public/agents/[id]/route.ts',
  'frontend/app/api/public/conversations/route.ts',
  'frontend/app/api/public/livekit/token/route.ts',
  'frontend/app/api/public/messages/route.ts',
  'frontend/app/api/public/websocket/config/route.ts',
]

let fixed = 0

for (const filePath of filesToCheck) {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false

  // Check if file uses request in body but has _request in signature
  const usesRequest = /\brequest\.(json|formData|nextUrl|headers|body|method|url)/.test(content)
  const hasUnderscoreRequest = /export async function (GET|POST|PATCH|DELETE|PUT)\(_request: NextRequest/.test(content)

  if (usesRequest && hasUnderscoreRequest) {
    // Replace _request with request in function signatures
    content = content.replace(
      /export async function (GET|POST|PATCH|DELETE|PUT)\(_request: NextRequest/g,
      'export async function $1(request: NextRequest'
    )
    modified = true
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8')
    console.log(`✅ Fixed: ${filePath}`)
    fixed++
  }
}

console.log(`\n📊 Fixed ${fixed} file(s)`)



