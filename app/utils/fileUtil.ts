import fs from 'fs'
import https from 'https'
import http from 'http'
import compressing from 'compressing'
import pipe from 'multipipe'
import log4j from './log4j'
const logger = log4j.getLogger()
export default {
  /**
   * 图片链接转文件
   * @param url
   * @param path
   * @param type 0 http 1 https
   */
  imgUrlToFile: function (url: string, path: string, type: string): void {
    const stream: fs.WriteStream = fs.createWriteStream(path)
    if (type === '0') {
      http.get(url, (res: http.IncomingMessage): void => {
        res.pipe(stream)
      })
    } else {
      https.get(url, (res: http.IncomingMessage): void => {
        res.pipe(stream)
      })
    }
  },

  /**
   * base64字符串转文件
   * @param base64Str
   * @param path
   */
  base64ToFile: function (base64Str: string, path: string): void {
    const contentBuffer: Buffer = Buffer.from(base64Str, 'base64')
    fs.writeFileSync(path, contentBuffer, 'base64')
  },

  /**
   * 移动或重命名文件
   * @param oldFile
   * @param newFile
   */
  moveOrRenameFile: function (oldFile: string, newFile: string): void {
    fs.copyFileSync(oldFile, newFile)
    fs.unlinkSync(oldFile)
    // const readStream: fs.ReadStream = fs.createReadStream(oldFile)
    // const writeStream: fs.WriteStream = fs.createWriteStream(newFile)
    // readStream.pipe(writeStream)
    // readStream.on('end', (): void => {
    //   fs.unlink(oldFile, err => {
    //     if (err) {
    //       throw err
    //     }
    //     logger.info('delete file successfully')
    //   })
    // })
  },

  /**
   * 校验文件是否存在
   * @param path
   */
  isFileExisted: function (path: string): Promise<boolean> {
    return new Promise(function (resolve: (value?: boolean | PromiseLike<boolean>) => void) {
      fs.access(path, (err: NodeJS.ErrnoException): void => {
        if (err) {
          console.log(`--------错误: ${err.message}`)
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  },

  /**
   * 文件压缩
   * @param sourceFileList
   * @param targetFilePath
   */
  fileCompress: function (sourceFileList: Array<string>, targetFilePath: string): void {
    const zipStream = new compressing.zip.Stream()
    for (const sourceFile of sourceFileList) {
      zipStream.addEntry(sourceFile)
    }
    const destStream = fs.createWriteStream(targetFilePath)
    pipe(zipStream, destStream, (err: Error) => {
      logger.error('----------fileCompress error:%s', err)
    })
  },

  writeFileData: function (str: string, path: string): void {
    // 创建一个可以写入的流，写入到文件'D:/001shuliantong/V4.0.0_demo/DataLinkPlatform_chromium/test.html'
    const writerStream = fs.createWriteStream(path)
    // 使用 utf8 编码写入数据
    writerStream.write(str, 'utf8')
    // 标记文件末尾
    writerStream.end()
    // 处理流事件 --> finish 事件 所有数据已被写入到底层系统时触发
    writerStream.on('finish', () => {
      console.log('写入完成')
    })
    writerStream.on('error', (err) => {
      console.log(err.stack)
    })
    console.log('程序执行完毕')
  }

}
