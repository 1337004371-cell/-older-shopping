const fs = require('fs')
const path = require('path')

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8'))

const c1 = require('./content-1-28.cjs')
const c2 = require('./content-29-56.cjs')
const c3 = require('./content-57-83.cjs')

const allFixes = Object.assign({}, c1, c2, c3)

let fixed = 0
products.forEach(function(p) {
  if (allFixes[p.id]) {
    p.sceneWiki = allFixes[p.id].sceneWiki
    p.peerReviews = allFixes[p.id].peerReviews
    fixed++
  } else {
    console.log('MISSING: ' + p.id + ' ' + p.name)
  }
})

const outPath = path.join(__dirname, 'seed-data-fixed.json')
fs.writeFileSync(outPath, JSON.stringify(products, null, 2), 'utf-8')

console.log('Fixed: ' + fixed + '/' + products.length)
console.log('Output: ' + outPath)
console.log('Size: ' + (fs.statSync(outPath).size / 1024).toFixed(1) + ' KB')
