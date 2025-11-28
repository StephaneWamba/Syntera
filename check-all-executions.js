/**
 * Check all recent workflow executions with full details
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function checkAll() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  // Get all recent executions
  const { data: executions, error } = await supabase
    .from('workflow_executions')
    .select('*, workflows(name, trigger_type)')
    .order('executed_at', { ascending: false })
    .limit(5)
  
  if (error || !executions || executions.length === 0) {
    console.error('❌ No executions found')
    return
  }
  
  console.log(`📊 Found ${executions.length} recent execution(s):\n`)
  
  executions.forEach((exec, i) => {
    const workflow = exec.workflows
    console.log(`${i + 1}. ${workflow?.name || 'Unknown'}`)
    console.log(`   Status: ${exec.status}`)
    console.log(`   Time: ${new Date(exec.executed_at).toLocaleString()}`)
    console.log(`   Duration: ${exec.execution_time_ms}ms`)
    
    if (exec.error_message) {
      console.log(`   ❌ ERROR: ${exec.error_message}`)
      if (exec.error_stack) {
        console.log(`   Stack: ${exec.error_stack.substring(0, 200)}...`)
      }
    }
    
    // Count nodes in execution data
    const nodeCount = Object.keys(exec.execution_data || {}).length
    console.log(`   Nodes executed: ${nodeCount}`)
    console.log(`   Node IDs: ${Object.keys(exec.execution_data || {}).join(', ')}`)
    console.log('')
  })
}

checkAll()




