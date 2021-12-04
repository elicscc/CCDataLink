/**
 * log4j日志
 */
import log4js from 'log4js'
import os from 'os'
import path from 'path'

const homePath = os.homedir().replace(new RegExp(/\\/, 'g'), '/')

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
      filename: process.env.EXECUTOR ? 'platform-logs/log' : path.join(homePath, 'platform-logs/log'), // 指定输出文件路径
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      compress: true,
      daysToKeep: 180
    },
    err: {
      // 错误日志
      type: 'dateFile',
      filename: process.env.EXECUTOR ? 'platform-logs/errlog/err' : path.join(homePath, 'platform-logs/errlog/err'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      compress: true,
      daysToKeep: 180
    }
  },
  categories: {
    // appenders:采用的appender,取appenders项,level:设置级别
    default: { appenders: ['stdout', 'info'], level: 'debug' },
    err: { appenders: ['stdout', 'err'], level: 'error' }
  }
})

export default {
  getLogger (): any {
    return {
      info: function (message: any, ...args: any[]) {
        log4js.getLogger('default').info(message, ...args)
      },
      error: function (message: any, ...args: any[]) {
        log4js.getLogger('err').error(message, ...args)
      }
    }
  }
}
