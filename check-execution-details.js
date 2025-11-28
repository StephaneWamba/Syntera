/**
 * Check detailed workflow execution data
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function checkDetails() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  // Get most recent execution
  const { data: executions, error } = await supabase
    .from('workflow_executions')
    .select('*, workflows(name, trigger_type)')
    .order('executed_at', { ascending: false })
    .limit(1)
  
  if (error || !executions || executions.length === 0) {
    console.error('❌ No executions found')
    return
  }
  
  const exec = executions[0]
  const workflow = exec.workflows
  
  console.log('📋 Workflow Execution Details')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Workflow: ${workflow?.name || 'Unknown'}`)
  console.log(`Trigger: ${workflow?.trigger_type || 'unknown'}`)
  console.log(`Status: ${exec.status}`)
  console.log(`Duration: ${exec.execution_time_ms}ms`)
  console.log(`Executed: ${new Date(exec.executed_at).toLocaleString()}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('📤 Trigger Data:')
  console.log(JSON.stringify(exec.trigger_data, null, 2))
  console.log('')
  
  console.log('📥 Execution Data:')
  console.log(JSON.stringify(exec.execution_data, null, 2))
  console.log('')
  
  if (exec.error_message) {
    console.log('❌ Error Message:')
    console.log(exec.error_message)
    console.log('')
  }
  
  if (exec.error_stack) {
    console.log('📚 Error Stack:')
    console.log(exec.error_stack)
  }
}

checkDetails()




