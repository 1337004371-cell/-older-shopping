/**
 * 国内电商商品抓取脚本 — 京东 / 天猫 / 淘宝 / 抖音好物
 *
 * Usage: node scripts/scrape-domestic.cjs
 *
 * Reads:  GOODS.txt
 * Output: scripts/scraped-domestic.json
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const links = fs.readFileSync(path.join(__dirname, '..', 'GOODS.txt'), 'utf-8')
  .split('\n').map(l => l.trim()).filter(Boolean)

console.log(`=== Domestic E-commerce Scraper ===`)
console.log(`Total links: ${links.length}\n`)

// Parse URL → platform + itemId
function parseUrl(url) {
  const u = new URL(url)
  const host = u.hostname

  if (host.includes('jd.com') || host.includes('jd.hk')) {
    const m = u.pathname.match(/(\d+)/)
    return { platform: 'jd', itemId: m ? m[1] : null }
  }
  if (host.includes('tmall.com')) {
    return { platform: 'tmall', itemId: u.searchParams.get('id') }
  }
  if (host.includes('taobao.com')) {
    return { platform: 'taobao', itemId: u.searchParams.get('id') }
  }
  if (host.includes('jinritemai.com')) {
    return { platform: 'douyin', itemId: u.searchParams.get('id') }
  }
  return { platform: 'unknown', itemId: null }
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location
        const fullUrl = loc.startsWith('http') ? loc : new URL(loc, url).href
        return fetchPage(fullUrl).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      let body = ''
      res.setEncoding('utf-8')
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => resolve(body))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function decodeHtml(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
}

function extractTitle(html) {
  // Try og:title first
  const ogMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
  if (ogMatch) return decodeHtml(ogMatch[1]).trim()

  // Try <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    let t = decodeHtml(titleMatch[1]).trim()
    // Clean platform suffixes
    t = t.replace(/[-|–—]\s*(京东|京东商城|天猫|淘宝|Tmall|Taobao|JDMALL|全球购|好物|抖店).*/g, '').trim()
    t = t.replace(/[-|–—]\s*京东.*/g, '').trim()
    t = t.replace(/[-|–—]\s*天猫.*/g, '').trim()
    t = t.replace(/[-|–—]\s*淘宝.*/g, '').trim()
    return t
  }
  return ''
}

function extractImages(html, platform) {
  const images = []

  // og:image
  const ogImg = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
  if (ogImg) images.push(decodeHtml(ogImg[1]).trim())

  if (platform === 'jd') {
    // JD: data-lazy-img or src in product images
    const jdImgs = html.matchAll(/(?:data-lazy-img|src)=["']([^"']*(?:img\d{2}\.360buyimg\.com|img14\.360buyimg\.com|img30\.360buyimg\.com)[^"']*)["']/gi)
    for (const m of jdImgs) {
      let url = m[1]
      if (url.startsWith('//')) url = 'https:' + url
      if (!images.includes(url)) images.push(url)
    }
    // Also try jd-specific img patterns
    const jdImgs2 = html.matchAll(/["'](https?:\/\/img[^"']*?\.jpg[^"']*)["']/gi)
    for (const m of jdImgs2) {
      if (m[1].includes('360buyimg') && !images.includes(m[1])) images.push(m[1])
    }
  } else {
    // Tmall / Taobao / Douyin: extract all image URLs
    const allImgs = html.matchAll(/["'](https?:\/\/(?:img\.alicdn|imgnew\.taobaocdn|gw\.alicdn|cbu01\.alicdn|img\.douyinpic)[^"']*(?:\.jpg|\.png|\.webp)[^"']*)["']/gi)
    for (const m of allImgs) {
      if (!images.includes(m[1])) images.push(m[1])
    }
    // Douyin images
    const dyImgs = html.matchAll(/["'](https?:\/\/[^"']*?(?:douyinpic|bytedance|toutiao)[^"']*(?:\.jpg|\.png|\.webp)[^"']*)["']/gi)
    for (const m of dyImgs) {
      if (!images.includes(m[1])) images.push(m[1])
    }
  }

  return images
}

function extractPrice(html, platform) {
  if (platform === 'jd') {
    // Try various JD price patterns
    const patterns = [
      /"p":\s*"(\d+\.?\d*)"/,
      /"price":\s*"(\d+\.?\d*)"/,
      /¥\s*(\d+\.?\d*)/,
      /"finalPrice":\s*(\d+\.?\d*)/,
      /class="price"[^>]*>[^<]*?(\d+\.?\d*)/,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) return parseFloat(m[1])
    }
  }
  // Try generic price pattern
  const genericPrice = html.match(/["']price["']\s*:\s*["']?(\d+\.?\d*)["']?/)
  if (genericPrice) return parseFloat(genericPrice[1])

  return null
}

async function run() {
  const results = []
  const errors = []

  for (let i = 0; i < links.length; i++) {
    const url = links[i]
    const parsed = parseUrl(url)

    if (!parsed.itemId) {
      console.log(`[${i + 1}/${links.length}] SKIP (no ID): ${parsed.platform} ${url.slice(0, 60)}`)
      errors.push({ url, platform: parsed.platform, error: 'no item ID' })
      continue
    }

    try {
      const html = await fetchPage(url)
      const name = extractTitle(html)
      const allImages = extractImages(html, parsed.platform)
      const price = extractPrice(html, parsed.platform)

      if (!name) {
        console.log(`[${i + 1}/${links.length}] SKIP (no name): ${parsed.platform}/${parsed.itemId}`)
        errors.push({ url, platform: parsed.platform, itemId: parsed.itemId, error: 'no name' })
        continue
      }

      const mainImage = allImages[0] || ''
      const detailImageList = allImages.slice(1, 20) // cap at 20

      results.push({
        platform: parsed.platform,
        itemId: parsed.itemId,
        name,
        price,
        mainImage,
        detailImageList,
        buyUrl: url,
        imageCount: allImages.length,
      })

      console.log(
        `[${i + 1}/${links.length}] OK: ${parsed.platform}/${parsed.itemId} | ${name.slice(0, 30)} | ¥${price || '?'} | ${allImages.length} imgs`
      )
    } catch (err) {
      console.log(`[${i + 1}/${links.length}] ERROR: ${parsed.platform}/${parsed.itemId} — ${err.message}`)
      errors.push({ url, platform: parsed.platform, itemId: parsed.itemId, error: err.message })
    }

    // Rate limit
    if (i < links.length - 1) await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\n=== Results ===`)
  console.log(`Successful: ${results.length}`)
  console.log(`Errors: ${errors.length}`)

  // Platform breakdown
  const byPlatform = {}
  results.forEach(r => { byPlatform[r.platform] = (byPlatform[r.platform] || 0) + 1 })
  console.log('\nBy platform:')
  Object.entries(byPlatform).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  if (errors.length > 0) {
    console.log('\nFailed:')
    const errByPlatform = {}
    errors.forEach(e => { errByPlatform[e.platform] = (errByPlatform[e.platform] || 0) + 1 })
    Object.entries(errByPlatform).forEach(([k, v]) => console.log(`  ${k}: ${v}`))
  }

  const outputPath = path.join(__dirname, 'scraped-domestic.json')
  fs.writeFileSync(outputPath, JSON.stringify({ products: results, errors }, null, 2))
  console.log(`\nSaved to: ${outputPath}`)
}

run().catch(console.error)
