import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const cordovaDir = path.join(root, 'cordova')
const resourcesDir = path.join(cordovaDir, 'resources')

async function exists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function pickIconSource() {
  const candidates = [
    path.resolve(root, '../vue-factura/public/vite.svg'),
    path.resolve(root, '../vue-factura/public/icon.png'),
    path.resolve(root, '../vue-factura/public/favicon.png'),
    path.resolve(root, './public/vite.svg'),
    path.resolve(root, './public/icon.png'),
    path.resolve(root, './public/favicon.png'),
  ]
  for (const c of candidates) {
    if (await exists(c)) return c
  }
  return null
}

function runCordovaRes() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['cordova-res', 'android', '--skip-config', '--copy'], {
      cwd: cordovaDir,
      stdio: 'inherit',
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error('cordova-res failed with code ' + code))
    })
  })
}

async function main() {
  if (!(await exists(cordovaDir))) {
    console.error('[cordova-res] Cordova project not found. Run "npm run cordova:init" first.')
    process.exit(1)
  }
  const iconSrc = await pickIconSource()
  if (!iconSrc) {
    console.error('[cordova-res] No icon source found. Please add PNG/SVG icon in public/ (e.g. vite.svg or icon.png).')
    process.exit(1)
  }
  await ensureDir(resourcesDir)
  const ext = path.extname(iconSrc).toLowerCase()
  if (ext !== '.svg' && ext !== '.png') {
    console.error(`[cordova-res] Unsupported icon format: ${ext}. Use SVG or PNG.`)
    process.exit(1)
  }
  const target = path.join(resourcesDir, ext === '.svg' ? 'icon.svg' : 'icon.png')
  await fs.copyFile(iconSrc, target)
  console.log(`[cordova-res] Using icon source: ${iconSrc}`)
  console.log('[cordova-res] Generating Android icons...')
  await runCordovaRes()
  console.log('[cordova-res] Icons generated and copied into cordova/android res directories.')
}

main().catch((err) => {
  console.error('[cordova-res] Failed:', err)
  process.exit(1)
})