/**
 * ez66 product scraper v2 — extracts og:tags + shoplineimg IDs
 *
 * Usage:
 *   node scripts/scrape-ez66.cjs
 *
 * Reads:     mock/top100-products.json  (slug list + prices)
 * Output:    scripts/scraped-products.json
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const TOP100 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock', 'top100-products.json'), 'utf-8'))

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location
        const fullUrl = loc.startsWith('http') ? loc : `https://www.ez66.com.tw${loc}`
        return fetchPage(fullUrl).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => resolve(body))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
}

function extractOgMeta(html, property) {
  const regex = new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']+)["']`, 'i')
  const m = html.match(regex)
  return m ? decodeHtmlEntities(m[1]).trim() : ''
}

function extractShoplineImageIds(html) {
  const ids = new Set()
  const r1 = /img\.shoplineapp\.com\/media\/image_clips\/([a-f0-9]{24})/gi
  const r2 = /shoplineimg\.com\/5c2351a9ea89f40001107778\/([a-f0-9]{24})/gi
  let m
  while ((m = r1.exec(html)) !== null) ids.add(m[1])
  while ((m = r2.exec(html)) !== null) ids.add(m[1])
  return [...ids]
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function scrape() {
  console.log(`=== ez66 Product Scraper v2 ===`)
  console.log(`Total products: ${TOP100.length}\n`)

  const results = []
  const errors = []

  for (let i = 0; i < TOP100.length; i++) {
    const entry = TOP100[i]
    const slug = entry.slug.toLowerCase()
    const url = `https://www.ez66.com.tw/products/${slug}`

    try {
      const html = await fetchPage(url)

      // Check if redirected to homepage (invalid slug)
      const ogUrl = extractOgMeta(html, 'og:url')
      if (ogUrl && !ogUrl.includes('/products/')) {
        console.log(`[${i + 1}/${TOP100.length}] SKIP (redirected): ${slug}`)
        errors.push({ slug, error: 'redirected to homepage' })
        continue
      }

      const ogTitle = extractOgMeta(html, 'og:title')
      const ogImage = extractOgMeta(html, 'og:image')
      const ogDesc = extractOgMeta(html, 'og:description')

      if (!ogTitle) {
        console.log(`[${i + 1}/${TOP100.length}] SKIP (no og:title): ${slug}`)
        errors.push({ slug, error: 'no og:title' })
        continue
      }

      // Clean title: remove site suffix like " | 樂齡網"
      const name = ogTitle.replace(/\s*[|｜].*$/, '').trim()

      // Extract all image IDs from page
      const allIds = extractShoplineImageIds(html)

      // Build CDN URLs
      const CDN = 'https://shoplineimg.com/5c2351a9ea89f40001107778'
      const cdnImages = allIds.map((id) => `${CDN}/${id}/800x.webp?source_format=jpg`)

      // og:image is the main image — convert to CDN format
      let mainImage = ogImage
      const ogImgId = ogImage.match(/image_clips\/([a-f0-9]{24})/)
      if (ogImgId) {
        mainImage = `${CDN}/${ogImgId[1]}/800x.webp?source_format=jpg`
      }

      // Detail images = all other images (exclude main)
      const mainId = ogImgId ? ogImgId[1] : null
      const detailIds = allIds.filter((id) => id !== mainId)
      const detailImageList = detailIds.map((id) => `${CDN}/${id}/800x.webp?source_format=jpg`)

      results.push({
        slug,
        name,
        description: ogDesc.slice(0, 500),
        priceTWD: entry.price_ntd,
        priceRMB: Math.round(entry.price_ntd * 0.23),
        categoryGuess: entry.category_guess,
        mainImage,
        detailImageList,
        buyUrl: url,
        imageCount: allIds.length,
      })

      console.log(
        `[${i + 1}/${TOP100.length}] OK: ${name.slice(0, 35)}... NT$${entry.price_ntd} → ¥${Math.round(entry.price_ntd * 0.23)} (${allIds.length} imgs)`
      )
    } catch (err) {
      console.log(`[${i + 1}/${TOP100.length}] ERROR: ${slug} — ${err.message}`)
      errors.push({ slug, error: err.message })
    }

    if (i < TOP100.length - 1) await sleep(400)
  }

  console.log(`\n=== Results ===`)
  console.log(`Successful: ${results.length}`)
  console.log(`Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\nFailed slugs:')
    for (const e of errors) console.log(`  - ${e.slug}: ${e.error}`)
  }

  const outputPath = path.join(__dirname, 'scraped-products.json')
  fs.writeFileSync(outputPath, JSON.stringify({ products: results, errors }, null, 2))
  console.log(`\nSaved to: ${outputPath}`)
}

scrape().catch(console.error)
