import { app, BrowserWindow, ipcMain } from 'electron'
import { AxiosInstance } from 'axios'
import { cmptAxios, cmptAxiosGbk, get, post } from './app/utils/axiosForExecutor'
import path from 'path'
import stringUtil from './app/utils/stringUtil'
import java from 'java'
import Store from 'electron-store'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Store.initRenderer()
declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface Global {
            // 复制的数据
            copyTaskCmts: [],
            toCWindow: BrowserWindow,
            // 复制的属性
            copyProperties: [],
            // 复制的变量
            copyVariables: []
            industry: string,
            isUploading: boolean,
            isDownloading: boolean,
            historyJson: string,
            // 客户端登陆后token
            TOKEN: string,
            mainWindow: BrowserWindow,
            loginWindow: BrowserWindow,
            taskWindowWebContentsId: number,
            taskWindow: BrowserWindow,
            floatWindow: BrowserWindow,
            loadingWindow: BrowserWindow,
            dialogWindow: BrowserWindow,
            cmptAxios: AxiosInstance,
            cmptAxiosGbk: AxiosInstance,
            ftpConnectionTest: any,
            dataBaseHandler: any,
            EXECUTOR_BASE_API: string,
            BASE_API: string,
            IS_STOP_TASK: string,
            initJavaSuccess: number,
            cssSelector: string,
            selectOptionList: [],
            type: string,
            iframeSrc: string,
            iframeName: string,
            inputType: string,
            logo: string,
            documentText: string,
        }
    }
}

const javaLangSystem = java.import('java.lang.System')
javaLangSystem.out.printlnSync('----node_java start-----')
global.cmptAxios = cmptAxios
global.cmptAxiosGbk = cmptAxiosGbk
app.whenReady().then(createWindow)

app.setAppUserModelId('cc')
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080/index.html'
  : `file://${__dirname}/index.html`
// InitEnvVariable.initJava()
function createWindow () {
  const loginWindow = new BrowserWindow({
    icon: path.join(stringUtil.getStaticPath(), 'logo/logo.ico'),
    useContentSize: true,
    frame: true,
    width: 1200,
    height: 763,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }, // 解决require 异常
    center: true,
    maximizable: false, // 窗口是否可以最大化
    resizable: false, // 窗口是否可以改变尺寸
    movable: true, // 窗口是否可以移动
    autoHideMenuBar: true,
    show: false
  })
  loginWindow.loadURL(winURL)
  loginWindow.on('ready-to-show', function () {
    loginWindow.show() // 初始化后再显示
  })
}
