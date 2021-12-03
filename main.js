const {app, BrowserWindow, ipcMain, dialog} = require("electron");
const path = require("path")


const log4js = require('log4js')



log4js.configure({
    pm2: true,
    appenders: {
        stdout: {
            // 控制台输出
            type: 'console'
        },
        info: {
            // 请求转发日志
            type: 'dateFile', // 指定日志文件按时间打印
            filename: 'logs/log', // 指定输出文件路径
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            compress: true,
            daysToKeep: 180
        },
        err: {
            // 错误日志
            type: 'dateFile',
            filename: 'logs/errlog/err',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            compress: true,
            daysToKeep: 180
        }
    },
    categories: {
        // appenders:采用的appender,取appenders项,level:设置级别
        default: {appenders: ['stdout', 'info'], level: 'debug'},
        err: {appenders: ['stdout', 'err'], level: 'error'}
    }
})

function info(message, ...args) {
    log4js.getLogger('default').info(message, ...args)
}

function error(message, ...args) {
    log4js.getLogger('err').info(message, ...args)
}

function createWindow() {
    loginWindow = new BrowserWindow({
        icon: 'static/logo/logo.ico',
        useContentSize: true,
        frame: true,
        width: 450,
        height: 350,
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
        show: false,
    })
    loginWindow.show()
    const pageFile = 'static/server.html'
    loginWindow.loadFile(pageFile).then(res => {
    })
    // loginWindow.on('close', (e) => {
    //     // if (lock === '0') {
    //     //     event.preventDefault();
    //     // }
    //     e.preventDefault()
    //     downloadItem && downloadItem.pause()
    //     dialog.showMessageBox({
    //         type: 'info',
    //         title: '提示',
    //         buttons: ['确认', '取消'], //选择按钮，点击确认则下面的idx为0，取消为1
    //         cancelId: 1,
    //     }).then(idx => {
    //         if (idx.response === 1) {
    //             // 点击取消 恢复更新
    //
    //         } else {
    //             //点击确认，表示关闭窗口
    //
    //             mainWindow = null
    //             app.exit()
    //         }
    //     })
    // })

}



//关闭客户端
ipcMain.on('close', async () => {
    // loginWindow.webContents.send('ifCloseClient', 100)


})

app.whenReady().then(createWindow)




