/**
 * Check recent workflow executions
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
  
  console.log('🔍 Checking recent workflow executions...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
  
  if (!companies || companies.length === 0) {
    console.error('❌ No companies found')
    return
  }
  
  const companyId = companies[0].id
  
  // Get purchase_intent workflow
  const { data: workflows } = await supabase
    .from('workflows')
    .select('id, name')
    .eq('company_id', companyId)
    .eq('trigger_type', 'purchase_intent')
    .eq('enabled', true)
    .limit(1)
  
  if (!workflows || workflows.length === 0) {
    console.log('❌ No enabled purchase_intent workflows found')
    return
  }
  
  const workflowId = workflows[0].id
  console.log(`📋 Workflow: ${workflows[0].name} (${workflowId})`)
  console.log('')
  
  // Get recent executions (last 5)
  const { data: executions } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('executed_at', { ascending: false })
    .limit(5)
  
  if (!executions || executions.length === 0) {
    console.log('❌ No executions found for this workflow')
    return
  }
  
  console.log(`✅ Found ${executions.length} recent execution(s):`)
  console.log('')
  
  const now = Date.now()
  
  for (const exec of executions) {
    const execTime = new Date(exec.executed_at).getTime()
    const timeDiff = now - execTime
    const isRecent = timeDiff < 30000 // Last 30 seconds
    
    console.log(`📊 Execution: ${exec.id}`)
    console.log(`   Status: ${exec.status}`)
    console.log(`   Executed: ${new Date(exec.executed_at).toLocaleString()} ${isRecent ? '🆕 (RECENT)' : ''}`)
    console.log(`   Duration: ${exec.execution_time_ms}ms`)
    console.log(`   Triggered by: ${exec.triggered_by} (${exec.triggered_by_id})`)
    
    if (exec.error_message) {
      console.log(`   ❌ Error: ${exec.error_message}`)
    }
    
    // Show trigger data
    if (exec.trigger_data) {
      const triggerData = exec.trigger_data
      console.log(`   Trigger data:`)
      if (triggerData.intent) console.log(`     - Intent: ${triggerData.intent}`)
      if (triggerData.confidence) console.log(`     - Confidence: ${triggerData.confidence}`)
      if (triggerData.contactId) console.log(`     - Contact ID: ${triggerData.contactId}`)
      if (triggerData.conversationId) console.log(`     - Conversation ID: ${triggerData.conversationId}`)
    }
    
    // Show execution data (node outputs)
    if (exec.execution_data && Object.keys(exec.execution_data).length > 0) {
      console.log(`   Execution data:`)
      const execData = exec.execution_data
      for (const [nodeId, nodeResult] of Object.entries(execData)) {
        if (nodeResult && typeof nodeResult === 'object' && 'success' in nodeResult) {
          const result = nodeResult
          console.log(`     - Node ${nodeId}: ${result.success ? '✅' : '❌'} ${result.error || 'Success'}`)
          if (result.output && result.output.dealId) {
            console.log(`       Deal ID: ${result.output.dealId}`)
          }
        }
      }
    }
    
    console.log('')
  }
}

checkExecutions()




