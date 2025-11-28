/**
 * Check workflow executions from database
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function checkExecutions() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  // Get recent executions
  const { data: executions, error } = await supabase
    .from('workflow_executions')
    .select('*, workflows(name, trigger_type)')
    .order('executed_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
  
  if (!executions || executions.length === 0) {
    console.log('📭 No workflow executions found')
    return
  }
  
  console.log(`📊 Found ${executions.length} recent execution(s):\n`)
  
  executions.forEach((exec, i) => {
    const workflow = exec.workflows
    console.log(`${i + 1}. ${workflow?.name || 'Unknown Workflow'}`)
    console.log(`   Trigger: ${workflow?.trigger_type || 'unknown'}`)
    console.log(`   Status: ${exec.status}`)
    console.log(`   Time: ${new Date(exec.executed_at).toLocaleString()}`)
    if (exec.execution_time_ms) {
      console.log(`   Duration: ${exec.execution_time_ms}ms`)
    }
    if (exec.error_message) {
      console.log(`   ❌ Error: ${exec.error_message}`)
    }
    console.log('')
  })
}

checkExecutions()




