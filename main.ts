import { app, BrowserWindow } from 'electron'
import Store from 'electron-store'
import WindowUtil from './app/script/windowUtil'
import path from 'path'
import stringUtil from './app/utils/stringUtil'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ChildProcessPool } = require('electron-re')
declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface Global {
            mainWindow: BrowserWindow,
            BASE_API: string,
            son:any
        }
    }
}

const getLock = app.requestSingleInstanceLock()
if (!getLock) {
  app.quit()
} else {
  app.on('ready', () => {
    WindowUtil.createMainWindow()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      WindowUtil.createMainWindow()
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  app.on('second-instance', () => {
    global.mainWindow.focus()
  })
  app.setAppUserModelId('CC数据库工具')
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Store.initRenderer()
global.son = new ChildProcessPool({
  path: path.join(stringUtil.getStaticPath(), 'java/taskMain.js'),
  max: 3,
  env: { NODE_ENV: process.env.NODE_ENV }
})
