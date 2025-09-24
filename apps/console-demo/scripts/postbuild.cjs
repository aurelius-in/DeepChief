const fs = require('fs')
const path = require('path')

const docsDir = path.resolve(__dirname, '../../docs')

// Copy branding assets from repo root if present
for (const f of ['wordmark_dc.png', 'dc-150.png']) {
  const src = path.resolve(__dirname, '../../../', f)
  const dest = path.join(docsDir, f)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
  }
}

// Add 404.html for GitHub Pages SPA fallback
const indexHtml = fs.readFileSync(path.join(docsDir, 'index.html'), 'utf8')
fs.writeFileSync(path.join(docsDir, '404.html'), indexHtml)


