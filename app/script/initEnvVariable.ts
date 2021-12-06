import path from 'path'
import fs from 'fs'
import java from 'java'
import stringUtil from '../utils/stringUtil'
export default class InitEnvVariable {
  public static init ():void {
    // 设置环境变量,包装chromium启动的时候,不会弹出google api 秘钥失效的提示
    // process.env.GOOGLE_API_KEY = 'no'
    // process.env.GOOGLE_DEFAULT_CLIENT_ID = 'no'
    // process.env.GOOGLE_DEFAULT_CLIENT_SECRET = 'no'
  }

  /**
   * 初始化node-java,并加上全局变量,只初始化一次
   */
  public static initJava ():void {
    if (global.initJavaSuccess !== 1) {
      let baseDir:string
      if (process.env.EXECUTOR || process.env.NODE_ENV === 'development') {
        baseDir = path.join(stringUtil.getStaticPath(), 'dlt_db')
      } else {
        baseDir = path.join('C:\\Program Files\\DLTOpenJDK\\dlt_db')
      }
      const dependencies = fs.readdirSync(baseDir)
      dependencies.forEach(function (dependency:string) {
        java.classpath.push(baseDir + '/' + dependency)
      })
      global.initJavaSuccess = 1
    }
  }
}
