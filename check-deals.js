/**
 * Check if deals were created by workflow
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function checkDeals() {
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
  
  // Get recent deals
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*, contacts(email, first_name, last_name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  if (!deals || deals.length === 0) {
    console.log('📭 No deals found')
    return
  }
  
  console.log(`📊 Found ${deals.length} recent deal(s):\n`)
  
  deals.forEach((deal, i) => {
    const contact = deal.contacts
    console.log(`${i + 1}. ${deal.title}`)
    console.log(`   ID: ${deal.id}`)
    console.log(`   Stage: ${deal.stage}`)
    if (deal.value) {
      console.log(`   Value: €${deal.value}`)
    }
    if (contact) {
      console.log(`   Contact: ${contact.first_name || ''} ${contact.last_name || ''} (${contact.email || 'no email'})`)
    }
    console.log(`   Created: ${new Date(deal.created_at).toLocaleString()}`)
    console.log('')
  })
}

checkDeals()




