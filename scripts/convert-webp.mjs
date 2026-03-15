import sharp from 'sharp'
import { readdirSync, unlinkSync } from 'fs'
import { join } from 'path'

const dir = 'public/products'
const files = readdirSync(dir).filter(f => f.endsWith('.png'))

for (const file of files) {
  const input = join(dir, file)
  const output = join(dir, file.replace('.png', '.webp'))
  await sharp(input).webp({ quality: 85 }).toFile(output)
  unlinkSync(input)
  console.log(`✓ ${file} → ${file.replace('.png', '.webp')}`)
}

console.log(`\nDone: ${files.length} files converted.`)
