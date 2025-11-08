import { app, BrowserWindow, shell, ipcMain, session, Menu } from 'electron'
import { release } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initialize, enable } from '@electron/remote/main';

const __dirname = dirname(fileURLToPath(import.meta.url))
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

if (release().startsWith('6.1')) app.disableHardwareAcceleration()
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  initialize();
  win = new BrowserWindow({
    title: 'XieFactura',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    minWidth: 360,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      devTools: false,
    },
    autoHideMenuBar: true,
  })
  enable(win.webContents);
  // Hide native menu bar
  win.setMenuBarVisibility(false)
  win.removeMenu()
  // Block common shortcuts to open DevTools
  win.webContents.on('before-input-event', (event, input) => {
    const isOpenDevToolsShortcut =
      input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')
    if (isOpenDevToolsShortcut) event.preventDefault()
  })
  // Disable context menu (prevent Inspect element)
  win.webContents.on('context-menu', (event) => { event.preventDefault() })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url!)
  } else {
    win.loadFile(indexHtml)
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
}

app.whenReady().then(createWindow)
app.on('ready', () => {
  // Remove application menu globally
  try { Menu.setApplicationMenu(null) } catch {}
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: Object.assign(details.responseHeaders, {
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Methods': ['GET, POST, PUT, DELETE, PATCH, OPTIONS'],
        'Access-Control-Allow-Headers': ['X-Requested-With, Content-Type, Authorization'],
      }),
    });
  });
})
app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false,
    },
    autoHideMenuBar: true,
  })
  // Hide native menu on child window as well
  childWindow.setMenuBarVisibility(false)
  childWindow.removeMenu()
  // Disable context menu on child window
  childWindow.webContents.on('context-menu', (event) => { event.preventDefault() })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})