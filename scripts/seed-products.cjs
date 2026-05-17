/**
 * Cloud DB seed script — 老友购物 Top 83 Products
 *
 * Usage:
 *   TCB_SECRET_ID=xxx TCB_SECRET_KEY=xxx node scripts/seed-products.cjs
 *
 * Reads processed product data from scripts/seed-data.json,
 * clears the products collection, then seeds all records.
 */

const cloudbase = require('@cloudbase/node-sdk')
const fs = require('fs')
const path = require('path')

const { TCB_SECRET_ID, TCB_SECRET_KEY } = process.env

if (!TCB_SECRET_ID || !TCB_SECRET_KEY) {
  console.error('Missing TCB_SECRET_ID or TCB_SECRET_KEY environment variables.')
  console.error('Usage: TCB_SECRET_ID=xxx TCB_SECRET_KEY=xxx node scripts/seed-products.cjs')
  process.exit(1)
}

const app = cloudbase.init({
  env: 'cloud1-d5geeof2fb8b30efe',
  secretId: TCB_SECRET_ID,
  secretKey: TCB_SECRET_KEY,
})

const db = app.database()
const collection = db.collection('products')

// Load processed product data
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8'))

async function clearCollection() {
  console.log('Step 1: Clearing products collection...')
  let deleted = 0
  let hasMore = true

  while (hasMore) {
    const res = await collection.limit(100).get()
    const docs = res.data || []
    if (docs.length === 0) { hasMore = false; break }

    for (const doc of docs) {
      await collection.doc(doc._id).remove()
      deleted++
    }
    console.log(`  Deleted ${deleted} records so far...`)
  }

  console.log(`  Collection cleared. Total deleted: ${deleted}\n`)
}

async function seed() {
  console.log('=== 老友购物 Cloud DB Seed ===')
  console.log('Environment: cloud1-d5geeof2fb8b30efe')
  console.log('Collection:  products')
  console.log('Products:    ' + products.length)
  console.log('')

  // Step 1: Clear
  await clearCollection()

  // Step 2: Seed
  console.log('Step 2: Seeding products...')
  let batch = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    try {
      const res = await collection.add(product)
      batch++

      // Progress report every 20 products
      if (batch % 20 === 0 || i === products.length - 1) {
        console.log(`\n--- Progress: ${batch}/${products.length} ---`)
        // Show last 20 product names
        const start = Math.max(0, i - 19)
        for (let j = start; j <= i; j++) {
          console.log(`  [${j + 1}] ${products[j].name}`)
        }
        console.log('')
      }
    } catch (err) {
      console.error(`[ERROR] ${product.name}: ${err.message || err}`)
    }
  }

  console.log('Done. Total seeded: ' + batch)
}

seed().catch(console.error)
