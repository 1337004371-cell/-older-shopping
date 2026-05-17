const fs = require('fs')
const path = require('path')
const https = require('https')

const top100 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock', 'top100-products.json'), 'utf-8'))
const scraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-products.json'), 'utf-8'))

const scrapedSlugs = new Set(scraped.products.map(p => p.slug.toLowerCase()))
const missing = top100.filter(p => !scrapedSlugs.has(p.slug.toLowerCase()))

console.log(`=== Scraping ${missing.length} missing products ===\n`)

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location
        const fullUrl = loc.startsWith('http') ? loc : `https://www.ez66.com.tw${loc}`
        return fetchPage(fullUrl).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)) }
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => resolve(body))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function decodeHtml(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
}

function extractOg(html, prop) {
  const r = new RegExp(`<meta\\s+property=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i')
  const m = html.match(r)
  return m ? decodeHtml(m[1]).trim() : ''
}

function extractImgIds(html) {
  const ids = new Set()
  const r1 = /img\.shoplineapp\.com\/media\/image_clips\/([a-f0-9]{24})/gi
  const r2 = /shoplineimg\.com\/5c2351a9ea89f40001107778\/([a-f0-9]{24})/gi
  let m
  while ((m = r1.exec(html)) !== null) ids.add(m[1])
  while ((m = r2.exec(html)) !== null) ids.add(m[1])
  return [...ids]
}

const CDN = 'https://shoplineimg.com/5c2351a9ea89f40001107778'

async function run() {
  const results = []
  const errors = []

  for (let i = 0; i < missing.length; i++) {
    const entry = missing[i]
    const slug = entry.slug.toLowerCase()
    const url = `https://www.ez66.com.tw/products/${slug}`

    try {
      const html = await fetchPage(url)
      const ogUrl = extractOg(html, 'og:url')
      if (ogUrl && !ogUrl.includes('/products/')) {
        console.log(`[${i + 1}/${missing.length}] SKIP (redirect): ${slug}`)
        errors.push({ slug, error: 'redirected' })
        continue
      }

      const ogTitle = extractOg(html, 'og:title')
      const ogImage = extractOg(html, 'og:image')
      const ogDesc = extractOg(html, 'og:description')

      if (!ogTitle) {
        console.log(`[${i + 1}/${missing.length}] SKIP (no title): ${slug}`)
        errors.push({ slug, error: 'no title' })
        continue
      }

      const name = ogTitle.replace(/\s*[|｜].*$/, '').trim()
      const allIds = extractImgIds(html)
      const ogImgId = ogImage.match(/image_clips\/([a-f0-9]{24})/)
      const mainImage = ogImgId ? `${CDN}/${ogImgId[1]}/800x.webp?source_format=jpg` : ogImage
      const mainId = ogImgId ? ogImgId[1] : null
      const detailIds = allIds.filter(id => id !== mainId)
      const detailImageList = detailIds.map(id => `${CDN}/${id}/800x.webp?source_format=jpg`)

      results.push({
        slug, name,
        description: ogDesc.slice(0, 500),
        priceTWD: entry.price_ntd,
        priceRMB: Math.round(entry.price_ntd * 0.23),
        categoryGuess: entry.category_guess,
        mainImage,
        detailImageList,
        buyUrl: url,
        imageCount: allIds.length,
      })
      console.log(`[${i + 1}/${missing.length}] OK: ${name.slice(0, 40)} | NT$${entry.price_ntd} | ${allIds.length} imgs`)
    } catch (err) {
      console.log(`[${i + 1}/${missing.length}] ERROR: ${slug} — ${err.message}`)
      errors.push({ slug, error: err.message })
    }

    if (i < missing.length - 1) await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\nResults: ${results.length} OK, ${errors.length} failed`)
  if (errors.length > 0) {
    console.log('Failed:')
    errors.forEach(e => console.log(`  ${e.slug}: ${e.error}`))
  }

  // Merge into scraped-products.json
  scraped.products = scraped.products.concat(results)
  scraped.errors = scraped.errors.filter(e => !results.find(r => r.slug === e.slug)).concat(errors)
  fs.writeFileSync(path.join(__dirname, 'scraped-products.json'), JSON.stringify(scraped, null, 2))
  console.log(`\nSaved. Total: ${scraped.products.length} products`)
}

run().catch(console.error)
