import { BrowserWindow, Menu } from 'electron'

import path from 'path'
import stringUtil from '../utils/stringUtil'

export default class WindowUtil {
  public static createMainWindow (): void {
    Menu.setApplicationMenu(null)
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
}
