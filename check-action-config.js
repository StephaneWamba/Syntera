/**
 * Check action node configuration in detail
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function checkConfig() {
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
  
  // Get workflow
  const { data: workflows } = await supabase
    .from('workflows')
    .select('*')
    .eq('company_id', companyId)
    .eq('trigger_type', 'purchase_intent')
    .eq('enabled', true)
    .limit(1)
  
  if (!workflows || workflows.length === 0) {
    console.error('❌ No workflows found')
    return
  }
  
  const workflow = workflows[0]
  const actionNode = workflow.nodes.find(n => n.type === 'action')
  
  if (!actionNode) {
    console.log('❌ No action node found')
    return
  }
  
  console.log('📋 Action Node Full Data:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(JSON.stringify(actionNode, null, 2))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('🔍 Analysis:')
  console.log(`   Node ID: ${actionNode.id}`)
  console.log(`   Node Type: ${actionNode.type}`)
  console.log(`   Has data: ${!!actionNode.data}`)
  console.log(`   Has config: ${!!actionNode.data?.config}`)
  console.log(`   Config type: ${actionNode.data?.config?.type || 'MISSING'}`)
  
  if (actionNode.data?.config) {
    console.log('\n✅ Config exists:')
    console.log(JSON.stringify(actionNode.data.config, null, 2))
  } else {
    console.log('\n❌ Config is missing or malformed!')
    console.log('   This is why the action is not executing.')
  }
}

checkConfig()




