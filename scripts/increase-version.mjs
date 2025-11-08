import { promises as fs } from 'fs'
import path from 'path'

const pkgPath = path.resolve(process.cwd(), 'package.json')

function bumpPatch(version) {
  const parts = version.split('.')
  if (parts.length !== 3) return '0.0.1'
  const [major, minor, patch] = parts.map(Number)
  return [major, minor, (isNaN(patch) ? 0 : patch) + 1].join('.')
}

async function main() {
  const raw = await fs.readFile(pkgPath, 'utf-8')
  const pkg = JSON.parse(raw)
  const prev = pkg.version || '0.0.0'
  const next = bumpPatch(prev)
  pkg.version = next
  // Keep productName consistent via electron-builder.json5, no change here
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
  console.log(`[version] bumped: ${prev} -> ${next}`)
}

main().catch((err) => {
  console.error('[version] failed:', err)
  process.exit(1)
})