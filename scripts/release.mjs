import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

const root = process.cwd()

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const exe = (process.platform === 'win32' && (cmd === 'npm' || cmd === 'npx')) ? `${cmd}.cmd` : cmd
    const child = spawn(exe, args, {
      cwd: opts.cwd || root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

async function ensureCordovaProject() {
  const cordovaDir = path.join(root, 'cordova')
  try {
    await fs.access(cordovaDir)
    return
  } catch {}
  console.log('[release] Cordova project not found, initializing...')
  await run('npx', ['cordova', 'create', 'cordova', 'net.xie.factura', 'XieFactura'])
  await run('npx', ['cordova', 'platform', 'add', 'android'], { cwd: cordovaDir })
}

async function main() {
  console.log('[release] bumping version...')
  await run('node', ['scripts/increase-version.mjs'])

  console.log('[release] building Electron installer...')
  await run('npm', ['run', 'build:electron'])

  console.log('[release] ensuring Cordova project...')
  await ensureCordovaProject()

  console.log('[release] building mobile bundle...')
  await run('npm', ['run', 'build:mobile'])

  console.log('[release] syncing to cordova/www...')
  await run('npm', ['run', 'cordova:sync'])

  console.log('[release] generating android icons...')
  try {
    await run('npm', ['run', 'cordova:res'])
  } catch (e) {
    console.warn('[release] cordova-res failed or not installed, skipping icon generation. Using default icons.')
  }

  console.log('[release] building Android APK...')
  await run('npx', ['cordova', 'build', 'android'], { cwd: path.join(root, 'cordova') })

  // Copy APKs to output/<version>/android
  const version = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf-8')).version
  await copyAndroidApksToOutput(version)

  console.log('\n[release] All done!')
  console.log(`- Electron installer in output/${version}/`)
  console.log(`- Android APK in output/${version}/android/`)
}

main().catch((err) => {
  console.error('[release] failed:', err)
  process.exit(1)
})

async function copyAndroidApksToOutput(version) {
  const srcDir = path.join(root, 'cordova', 'platforms', 'android', 'app', 'build', 'outputs', 'apk')
  const destDir = path.join(root, 'output', version, 'android')
  await fs.mkdir(destDir, { recursive: true })

  async function walkAndCopy(dir) {
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch (e) {
      console.warn('[release] APK source directory not found, skipping copy:', dir)
      return
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walkAndCopy(full)
      } else if (entry.isFile() && entry.name.endsWith('.apk')) {
        const target = path.join(destDir, entry.name)
        await fs.copyFile(full, target)
        console.log('[release] copied APK:', path.relative(root, target))
      }
    }
  }

  await walkAndCopy(srcDir)
}