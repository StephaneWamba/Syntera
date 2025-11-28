/**
 * Check detailed workflow configuration
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkWorkflowDetails() {
  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1)
    if (!companies || companies.length === 0) {
      console.error('❌ No companies found')
      return
    }
    
    const companyId = companies[0].id
    
    // Get workflow details
    const { data: workflows } = await supabase
      .from('workflows')
      .select('*')
      .eq('company_id', companyId)
      .eq('trigger_type', 'purchase_intent')
      .eq('enabled', true)
    
    if (!workflows || workflows.length === 0) {
      console.log('❌ No enabled purchase_intent workflows found')
      return
    }
    
    workflows.forEach((wf, i) => {
      console.log(`\n📋 Workflow ${i + 1}: ${wf.name}`)
      console.log(`   ID: ${wf.id}`)
      console.log(`   Enabled: ${wf.enabled ? '✅' : '❌'}`)
      console.log(`   Trigger Type: ${wf.trigger_type}`)
      console.log(`   Trigger Config:`, JSON.stringify(wf.trigger_config || {}, null, 2))
      console.log(`   Nodes: ${wf.nodes?.length || 0}`)
      
      if (wf.nodes && wf.nodes.length > 0) {
        console.log(`\n   Node Details:`)
        wf.nodes.forEach((node, j) => {
          console.log(`   ${j + 1}. ${node.data?.label || node.id}`)
          console.log(`      Type: ${node.type}`)
          console.log(`      NodeType: ${node.nodeType}`)
          if (node.data?.config) {
            console.log(`      Config:`, JSON.stringify(node.data.config, null, 8))
          }
        })
      } else {
        console.log(`   ⚠️  No nodes configured!`)
      }
      
      console.log(`   Edges: ${wf.edges?.length || 0}`)
      if (wf.edges && wf.edges.length > 0) {
        wf.edges.forEach((edge, j) => {
          console.log(`   ${j + 1}. ${edge.source} → ${edge.target}`)
        })
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkWorkflowDetails()



