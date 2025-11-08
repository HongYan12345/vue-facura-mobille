import { promises as fs } from 'fs'
import path from 'path'

const root = process.cwd()
const distMobile = path.join(root, 'dist-mobile')
const cordovaWww = path.join(root, 'cordova', 'www')

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function rmDir(dir) {
  if (await exists(dir)) {
    await fs.rm(dir, { recursive: true, force: true })
  }
}

async function cpDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await cpDir(srcPath, destPath)
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function main() {
  if (!(await exists(distMobile))) {
    console.error('[cordova-sync] dist-mobile not found. Run "npm run build:mobile" first.')
    process.exit(1)
  }
  const cordovaDir = path.join(root, 'cordova')
  if (!(await exists(cordovaDir))) {
    console.error('[cordova-sync] cordova project not found. Run "npm run cordova:init" first.')
    process.exit(1)
  }

  await rmDir(cordovaWww)
  await cpDir(distMobile, cordovaWww)
  console.log('[cordova-sync] Copied dist-mobile -> cordova/www')
}

main().catch((err) => {
  console.error('[cordova-sync] Failed:', err)
  process.exit(1)
})