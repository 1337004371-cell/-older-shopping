/**
 * 拆分 import-products.json 为多个小文件（每文件 20 条）
 * 解决控制台导入大文件 ECONNRESET 问题
 */

const fs = require('fs')
const path = require('path')

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8'))
const BATCH = 20

for (let i = 0; i < products.length; i += BATCH) {
  const chunk = products.slice(i, i + BATCH)
  const num = Math.floor(i / BATCH) + 1
  const total = Math.ceil(products.length / BATCH)
  const outputPath = path.join(__dirname, `import-products-${num}-of-${total}.json`)

  fs.writeFileSync(outputPath, JSON.stringify(chunk, null, 2), 'utf-8')

  console.log(`[${num}/${total}] ${chunk.length} 条 → import-products-${num}-of-${total}.json (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`)
  chunk.forEach((p) => console.log(`  ${p.name.slice(0, 35)}...`))
  console.log('')
}

console.log(`共 ${Math.ceil(products.length / BATCH)} 个文件，按顺序逐个导入即可。`)
