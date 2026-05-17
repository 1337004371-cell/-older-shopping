/**
 * 导出为云开发控制台兼容的 JSON 文件
 *
 * Usage:
 *   node scripts/export-import-jsonl.cjs
 *
 * Output:
 *   scripts/import-products.json    — JSON 数组格式
 */

const fs = require('fs')
const path = require('path')

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8'))

const outputPath = path.join(__dirname, 'import-products.json')
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8')

console.log(`Done. ${products.length} records → ${outputPath}`)
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`)
console.log('')
console.log('导入步骤：')
console.log('  1. 打开腾讯云控制台 → 云开发 → cloud1 → 数据库')
console.log('  2. 点击「products」集合（如不存在先创建）')
console.log('  3. 点击「导入」→ 选择 import-products.json')
console.log('  4. 文件类型选 JSON')
console.log('  5. 点击确认导入')
