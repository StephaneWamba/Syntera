/**
 * Test intent detection directly
 */

import 'dotenv/config'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'

async function testIntentDetection() {
  console.log('🔍 Testing Intent Detection...\n')
  
  const testMessages = [
    'I want to buy the Premium plan for $99/month',
    'I\'m ready to purchase the Enterprise license',
    'Can I buy this product?',
    'How much does it cost?',
    'I need to purchase this immediately',
  ]
  
  for (const message of testMessages) {
    try {
      console.log(`Testing: "${message}"`)
      
      const response = await fetch(`${AGENT_SERVICE_URL}/api/public/test-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`   Intent: ${result.intent}`)
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`)
        if (result.confidence >= 0.8 && result.intent === 'purchase') {
          console.log(`   ✅ Would trigger workflow!`)
        } else {
          console.log(`   ⚠️  Confidence too low or not purchase intent`)
        }
      } else {
        console.log(`   ❌ API not available (status: ${response.status})`)
        console.log(`   Make sure agent service is running on ${AGENT_SERVICE_URL}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
      console.log(`   Make sure agent service is running on ${AGENT_SERVICE_URL}`)
    }
    console.log('')
  }
}

testIntentDetection()



