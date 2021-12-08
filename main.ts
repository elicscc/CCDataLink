import { app, BrowserWindow } from 'electron'
import Store from 'electron-store'
import InitEnvVariable from './app/script/initEnvVariable'
import WindowUtil from './app/script/windowUtil'
import dataBaseHandler from './app/utils/dataBaseHandler'
global.dataBaseHandler = dataBaseHandler
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
    WindowUtil.createMainWindow()
    WindowUtil.createTaskWindow()
    // if (process.env.NODE_ENV === 'development' && fs.existsSync('C:\\vue-tools')) {
    //   electron.session.defaultSession.loadExtension('C:\\vue-tools').then((r) => {
    //     console.log(r)
    //   })
    // }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      WindowUtil.createMainWindow()
      WindowUtil.createTaskWindow()
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
