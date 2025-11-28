/**
 * Check workflow structure to see if action nodes are connected
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
  
  // Get company ID
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
  
  if (!companies || companies.length === 0) {
    console.log('❌ No companies found')
    return
  }
  
  const companyId = companies[0].id
  
  // Get workflow with purchase_intent trigger
  const { data: workflows, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('company_id', companyId)
    .eq('trigger_type', 'purchase_intent')
    .eq('enabled', true)
    .limit(1)
  
  if (error || !workflows || workflows.length === 0) {
    console.error('❌ No purchase_intent workflows found')
    return
  }
  
  const workflow = workflows[0]
  
  console.log('📋 Workflow Structure')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Name: ${workflow.name}`)
  console.log(`ID: ${workflow.id}`)
  console.log(`Enabled: ${workflow.enabled}`)
  console.log(`Trigger Type: ${workflow.trigger_type}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('📦 Nodes:')
  const nodes = workflow.nodes || []
  nodes.forEach((node, i) => {
    console.log(`\n${i + 1}. ${node.type.toUpperCase()} Node (${node.id})`)
    console.log(`   Label: ${node.data?.label || 'N/A'}`)
    if (node.type === 'action' && node.data?.config) {
      console.log(`   Action Type: ${node.data.config.type}`)
      if (node.data.config.type === 'create_deal') {
        console.log(`   Title: ${node.data.config.title || 'N/A'}`)
        console.log(`   Contact ID: ${node.data.config.contact_id || 'N/A'}`)
        console.log(`   Stage: ${node.data.config.stage || 'N/A'}`)
        console.log(`   Value: ${node.data.config.value || 'N/A'}`)
      }
    }
  })
  
  console.log('\n🔗 Edges:')
  const edges = workflow.edges || []
  if (edges.length === 0) {
    console.log('   ⚠️  NO EDGES FOUND - Nodes are not connected!')
  } else {
    edges.forEach((edge, i) => {
      console.log(`\n${i + 1}. ${edge.source} → ${edge.target}`)
      console.log(`   Source Handle: ${edge.sourceHandle || 'default'}`)
      console.log(`   Target Handle: ${edge.targetHandle || 'default'}`)
    })
  }
  
  // Check if trigger is connected to action
  const triggerNode = nodes.find(n => n.type === 'trigger')
  const actionNodes = nodes.filter(n => n.type === 'action')
  
  if (triggerNode && actionNodes.length > 0) {
    const hasConnection = edges.some(e => 
      e.source === triggerNode.id && actionNodes.some(a => a.id === e.target)
    )
    
    if (!hasConnection) {
      console.log('\n❌ WARNING: Trigger node is NOT connected to any action nodes!')
      console.log('   The workflow will only execute the trigger, not the actions.')
    } else {
      console.log('\n✅ Trigger node is connected to action node(s)')
    }
  }
}

checkWorkflow()




