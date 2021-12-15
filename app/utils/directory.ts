/*
 * @Author: 招宝天尊
 * @Date: 2020-11-11 09:08:25
 * @LastEditTime: 2020-11-18 17:45:16
 * @LastEditors: Please set LastEditors
 * @Description:目录工具类
 * @FilePath: \DataLinkPlatform\app\utils\directory.ts
 */
import os from 'os'
import fs from 'fs'
import log4js from './log4j'

const logger = log4js.getLogger()
const homePath: string = os.homedir().replace(new RegExp(/\\/, 'g'), '/')
export default {
  /**
     * 生成任务临时文件目录
     * @param uuid
     */
  getTaskPath: function (uuid: string): string {
    if (!uuid) {
      throw new Error('getTaskPath中uuid为空！')
    }
    const path = homePath + '/SLT_Temp/' + uuid + '/'
    if (!fs.existsSync(path)) {
      // 创建目录
      this.mkdir(path)
    }
    return path
  },

  /**
   * 生成excel输出组件临时目录
   * @param uuid
   */
  getExcelOutPath: function (uuid: string): string {
    const path = homePath + '/SLT_Temp/' + uuid + '/excel_out/'
    if (!fs.existsSync(path)) {
      // 创建目录
      this.mkdir(path)
    }
    return path
  },

  /**
   * 生成leveldb临时目录
   * @param uuid
   */
  getLeveldbPath: function (uuid: string): string {
    if (!uuid) {
      throw new Error('getLeveldbPath中uuid为空！')
    }
    const path = homePath + '/SLT_Temp/' + uuid + '/leveldb/'
    if (!fs.existsSync(path)) {
      // 创建目录
      this.mkdir(path)
    }
    return path
  },

  /**
     * 生成目录
     * @param filePath 传入的路径不允许用 \\
     */
  mkdir: function (filePath: string): void {
    filePath = filePath.replace(new RegExp(/\\/, 'g'), '/')
    const dirCache: Record<string, boolean> = {}
    const arr: string[] = filePath.split('/')
    let dir: string = arr[0]
    for (let i = 1; i < arr.length; i++) {
      if (!dirCache[dir] && !fs.existsSync(dir)) {
        dirCache[dir] = true
        fs.mkdirSync(dir)
      }
      dir = dir + '/' + arr[i]
    }
    // fs.writeFileSync(filePath, '')
  },
  /**
     * 删除任务临时文件目录
     * @param uuid
     */
  deleteTaskPath: function (uuid: string): void {
    if (!uuid) {
      throw new Error('deleteTaskPath中uuid为空！')
    }
    const path = homePath + '/SLT_Temp/' + uuid + '/'
    this.delDir(path)
    logger.info('删除临时文件成功，当前uuid:', uuid)
  },
  /**
     * 递归删除目录
     * @param path 传入的路径不允许用 \\
     */
  delDir: function (path: string): void {
    path = path.replace(new RegExp(/\\/, 'g'), '/')
    let files = []
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path)
      files.forEach(file => {
        const curPath = path + '/' + file
        if (fs.statSync(curPath).isDirectory()) {
          this.delDir(curPath) // 递归删除文件夹
        } else {
          fs.unlinkSync(curPath) // 删除文件
        }
      })
      fs.rmdirSync(path) // 删除文件夹自身
    }
  },
  /**
   * 获取附件下载临时文件目录
   * @param uuid
   */
  getDownloadFileTmpPath: function (uuid: string, isDownloadFlag: boolean) {
    if (!uuid) {
      throw new Error('getDownloadFileTmpPath中uuid为空！')
    }
    let path = ''
    if (isDownloadFlag) {
      // path = os.homedir() + '/SLT_Temp/' + uuid + '/download/'
      path = os.homedir() + '\\Downloads\\'
    } else {
      path = homePath + '/SLT_Temp/' + uuid + '/download/'
    }
    if (!fs.existsSync(path)) {
      // 创建目录
      this.mkdir(path)
    }
    return path
  }

}
