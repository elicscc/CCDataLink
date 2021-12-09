import { app, BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import InitEnvVariable from './app/script/initEnvVariable'
import WindowUtil from './app/script/windowUtil'
import cluster from 'child_process'
import dataBaseHandler from './app/utils/dataBaseHandler'
import path from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MessageChannel, BrowserService } = require('electron-re')
declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface Global {
            industry: string,
            mainWindow: BrowserWindow,
            loadingWindow: BrowserWindow,
            EXECUTOR_BASE_API: string,
            BASE_API: string,
            initJavaSuccess: number,
            son:any
        }
    }
}

const getLock = app.requestSingleInstanceLock()
if (!getLock) {
  app.quit()
} else {
  app.on('ready', async () => {
    // const appService = new BrowserService('app', path.join(__dirname, 'app/script/taskMain.js'), {
    //   webContents: {
    //     webSecurity: false
    //   }
    // })
    // console.log(appService)
    WindowUtil.createMainWindow()
    // await appService.connected()
    // appService.openDevTools()
    // MessageChannel.send('app', 'test_java', { test: 'test' })
    // WindowUtil.createTaskWindow()
    // if (process.env.NODE_ENV === 'development' && fs.existsSync('C:\\vue-tools')) {
    //   electron.session.defaultSession.loadExtension('C:\\vue-tools').then((r) => {
    //     console.log(r)
    //   })
    // }

    global.son = cluster.fork(path.join(__dirname, 'app/script/taskMain.js'))
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      WindowUtil.createMainWindow()
      // WindowUtil.createTaskWindow()
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

//
// // 接收来自标识为asynchronous-message的消息
ipcMain.on('test_replay', function (event, arg) {
  console.log('Sd')
})
