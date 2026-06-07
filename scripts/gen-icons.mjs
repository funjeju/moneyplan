import sharp from './node_modules/sharp/lib/index.js'
import { readFileSync, writeFileSync } from 'fs'

const svg = readFileSync('./public/icon.svg')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`./public/icons/icon-${size}x${size}.png`)
  console.log(`✓ icon-${size}x${size}.png`)
}

// apple touch icon 180x180
await sharp(svg).resize(180, 180).png().toFile('./public/apple-touch-icon.png')
console.log('✓ apple-touch-icon.png')

// favicon 32x32
await sharp(svg).resize(32, 32).png().toFile('./public/favicon-32x32.png')
console.log('✓ favicon-32x32.png')
