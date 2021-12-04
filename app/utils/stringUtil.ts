import path from 'path'
// import moment from 'moment'

export default {
  /**
   * 判断字符串是否为空
   * @param obj
   */
  isEmpty: function (obj: string): boolean {
    if (typeof obj === 'undefined' || obj === null || obj === '') {
      return true
    } else {
      return false
    }
  },

  /**
   *  判断json对象是否为空
   * @param obj
   * @returns true为空 false为不空
   */
  isEmptyForObj: function (obj: any): boolean {
    return Object.keys(obj).length === 0
  },

  /**
   * 正则校验字符串是否为http或https链接
   * @param src
   * @returns 0 http连接 1 https连接 2 base64字符串
   */
  checkUrl: function (src: string): string {
    const httpExpression = /http?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/
    if (new RegExp(httpExpression).test(src) === true) {
      return '0'
    }
    const httpsExpression = /https?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/
    if (new RegExp(httpsExpression).test(src) === true) {
      return '1'
    }
    const base64Expression = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*?)\s*$/i
    if (new RegExp(base64Expression).test(src) === true) {
      return '2'
    }
    return '-1'
  },

  processExePath: function (path: string): string {
    if (path.endsWith('\\')) {
      path = path.substr(0, path.length - 1)
    }
    if (path.indexOf(' ') > 0) {
      path = `"${path}"`
    }
    return path
  },

  /**
   * 获取执行窗口句柄程序的路径
   */
  getHandlePath: function (fileName: string): string {
    return path.join(this.getStaticPath(), 'windows-handle', fileName)
  },
  /**
   * 获取static目录对应的位置
   */
  getStaticPath: function (): string {
    /**
     * Set `__static` path to static files in production
     * __static开发环境就是同目录下的static,prod环境就是跟resources目录同级的一个static目录
     */
    if (process.env.EXECUTOR) {
      return path.resolve(path.join('.', '/static')).replace(/\\/g, '\\\\')
    } else if (process.env.NODE_ENV === 'production') {
      return path.join(__dirname, '..', '..', '..', '/static').replace(/\\/g, '\\\\')
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore __static 会在webpack打包 时候定义
      return __static
    }
  },
  /**
   * 检查是否为正整数或0
   * @param params
   * @param max
   * @returns
   */
  checkInteger: function (params: string, max?: number): boolean {
    const reg = /^[1-9][0-9]*$/
    if (max) {
      if ((reg.test(params) || params === '0') && (parseInt(params) < max || parseInt(params) === max)) {
        return true
      } else {
        return false
      }
    }
    if (reg.test(params) || params === '0') {
      return true
    } else {
      return false
    }
  },

  /**
   * 截取url后的文件名
   * @param url
   * @returns
   */
  getFileNameFromUrl: function (url: string): string {
    const pos = url.lastIndexOf('/')
    return url.substr(pos + 1)
  },

  /**
   * 检测是否含有中文
   * @param str
   * @returns
   */
  checkChinese (str: string): boolean {
    const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g')
    return !!reg.test(str)
  },
  // toStr (date: Date = new Date(), format = 'YYYY-MM-DD HH:mm:ss'): string {
  //   return moment(date).format(format)
  // }
  /**
   * 截取中间字符
   * @param text
   * @param begin
   * @param end
   * @returns
   */
  subStringMulti (text: string, begin: string, end: string): string {
    const temp = text.split(begin, 2)
    const content = temp[1].split(end, 2)
    return content[0]
  },

  /**
   * 强转成字符串
   * @param str
   */
  convertToString (str: any): string {
    if (!str) {
      return null
    }
    return typeof str !== 'string' ? JSON.stringify(str) : str
  },

  /**
   * HTML标签转义
   * @param sHtml
   * @returns
   */
  html2Escape (sHtml: string): string {
    return sHtml.replace(/[<>&"]/g, function (c) {
      return {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;'
      }[c]
    })
  }
}
