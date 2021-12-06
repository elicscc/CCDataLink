import { app, BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import InitEnvVariable from './app/script/initEnvVariable'
import WindowUtil from './app/script/windowUtil'

declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface Global {
            industry: string,
            mainWindow: BrowserWindow,
            loadingWindow: BrowserWindow,
            dataBaseHandler: any,
            EXECUTOR_BASE_API: string,
            BASE_API: string,
            initJavaSuccess: number,
        }
    }
}

const getLock = app.requestSingleInstanceLock()
if (!getLock) {
  app.quit()
} else {
  app.on('ready', () => {
    WindowUtil.createLoadingWindow()
    WindowUtil.createMainWindow()
    ipcMain.on('close-loading-window', (event, quitApp) => {
      console.log('receive close window ipc', quitApp)
      if (quitApp) {
        app.quit()
      } else {
        global.mainWindow.show()
        global.loadingWindow.close()
      }
    })
    // if (process.env.NODE_ENV === 'development' && fs.existsSync('C:\\vue-tools')) {
    //   electron.session.defaultSession.loadExtension('C:\\vue-tools').then((r) => {
    //     console.log(r)
    //   })
    // }
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
InitEnvVariable.initJava()
