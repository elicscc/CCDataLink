import { BrowserWindow } from 'electron'

import path from 'path'
import stringUtil from '../utils/stringUtil'

export default class WindowUtil {
  public static createMainWindow (): void {
    global.mainWindow = new BrowserWindow({
      icon: path.join(stringUtil.getStaticPath(), 'logo/logo.ico'),
      useContentSize: true,
      title: 'CC数据库连接工具',
      frame: true,
      width: 1200,
      height: 763,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        nodeIntegrationInWorker: true
      }, // 解决require 异常
      center: true,
      maximizable: true, // 窗口是否可以最大化
      resizable: true, // 窗口是否可以改变尺寸
      movable: true, // 窗口是否可以移动
      show: true
    })
    process.env.NODE_ENV === 'development'
      ? global.mainWindow.loadURL('http://localhost:9080')
      : global.mainWindow.loadFile(`${__dirname}/index.html`)
    // global.mainWindow.once('ready-to-show', function () {
    //   global.mainWindow.show() // 初始化后再显示
    // })
    global.mainWindow.on('closed', function () {
      global.mainWindow = null
    })
  }
  //
  // /**
  //    * 创建ToC 的启动加载页面
  //    */
  // public static createLoadingWindow (): void {
  //   const url = stringUtil.getStaticPath() + '/loading/loading.html'
  //   const width = 560
  //   const height = 370
  //
  //   global.loadingWindow = new BrowserWindow({
  //     useContentSize: true,
  //     frame: true,
  //     width: width,
  //     height: height,
  //     title: 'CC数据库连接工具',
  //     icon: path.join(stringUtil.getStaticPath(), 'logo/logo.ico'),
  //     webPreferences: {
  //       webSecurity: false,
  //       nodeIntegration: true,
  //       enableRemoteModule: true,
  //       nodeIntegrationInWorker: true
  //     }, // 解决require 异常
  //     transparent: true,
  //     backgroundColor: '#00000000',
  //     center: true,
  //     maximizable: false, // 窗口是否可以最大化
  //     resizable: false, // 窗口是否可以改变尺寸
  //     movable: false, // 窗口是否可以移动
  //     show: true
  //   })
  //   global.loadingWindow.loadFile(url)
  //   global.loadingWindow.show()
  //   global.loadingWindow.on('close', function () {
  //     if (global.mainWindow && !global.mainWindow.isVisible()) {
  //       global.mainWindow.close()
  //     }
  //   })
  // }

  // 创建隐藏window
  public static createTaskWindow (): void {
    const url = stringUtil.getStaticPath() + '/loading/loading.html'
    global.mainWindow = new BrowserWindow({
      width: 500,
      height: 500,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    })
    global.mainWindow.loadFile(url)
  }
}
