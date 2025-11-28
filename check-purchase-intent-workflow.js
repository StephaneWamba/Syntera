/**
 * Check if purchase_intent workflow exists and is enabled
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function checkWorkflow() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  console.log('🔍 Checking for purchase_intent workflows...')
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
  
  const { data: workflows } = await supabase
    .from('workflows')
    .select('id, name, enabled, trigger_type, nodes, edges')
    .eq('company_id', companyId)
    .eq('trigger_type', 'purchase_intent')
  
  if (!workflows || workflows.length === 0) {
    console.log('❌ No purchase_intent workflows found')
    console.log('')
    console.log('📝 To test the workflow, create one in the UI:')
    console.log('   1. Go to Dashboard → Workflows')
    console.log('   2. Create new workflow')
    console.log('   3. Set trigger: purchase_intent')
    console.log('   4. Add action: create_deal')
    console.log('   5. Enable the workflow')
    return
  }
  
  console.log(`✅ Found ${workflows.length} purchase_intent workflow(s):`)
  console.log('')
  
  for (const workflow of workflows) {
    console.log(`📋 Workflow: ${workflow.name}`)
    console.log(`   ID: ${workflow.id}`)
    console.log(`   Enabled: ${workflow.enabled ? '✅ Yes' : '❌ No'}`)
    console.log(`   Nodes: ${workflow.nodes?.length || 0}`)
    console.log(`   Edges: ${workflow.edges?.length || 0}`)
    
    // Check if it has a create_deal action
    const nodes = workflow.nodes || []
    const hasCreateDeal = nodes.some((node) => 
      node.data?.config?.type === 'create_deal' || 
      node.data?.nodeType === 'create_deal' ||
      node.nodeType === 'create_deal'
    )
    
    console.log(`   Has create_deal action: ${hasCreateDeal ? '✅ Yes' : '❌ No'}`)
    console.log('')
  }
  
  const enabledWorkflows = workflows.filter(w => w.enabled)
  if (enabledWorkflows.length === 0) {
    console.log('⚠️  No enabled purchase_intent workflows found')
    console.log('   Enable a workflow to test the purchase intent flow')
  }
}

checkWorkflow()

