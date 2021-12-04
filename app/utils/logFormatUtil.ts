import dateToString from './dateToString'

/**
 * 循环替换字符串中的占位符
 * @param strTemplate
 * @param args
 */
function replaceTemplate (strTemplate: string, args: any[]):string {
  let s = strTemplate
  for (let i = 0; i < args.length; i++) {
    const index = i + 1// 字符串模板中从1开始,i从0开始,所以 + 1
    s = s.replace(new RegExp('\\{' + index + '\\}', 'g'), args[i])
  }
  return s
}
export default class LogFormatUtil {
  /**
   * 格式化日志输出
   * @param strTemplate
   * @param args
   */
  public static format (strTemplate: string, ...args: any[]):string {
    const s = replaceTemplate(strTemplate, args)
    return '[' + dateToString.getDatetime() + ']:' + s
  }

  /**
   * 格式化输出错误日志
   * @param addTimestamp 是否拼接时间
   * @param strTemplate
   * @param args
   */
  public static formatErr (addTimestamp: boolean, strTemplate: string, ...args:any[]):string {
    let logStr = replaceTemplate(strTemplate, args)
    if (addTimestamp) {
      logStr = '[' + dateToString.getDatetime() + ']:' + logStr
    }
    logStr = '<span style=\'color:red\'>' + logStr + '</span><br>'
    return logStr
  }

  /**
   * 格式化输出错误日志
   * @param addTimestamp 是否拼接时间
   * @param strTemplate
   * @param args
   */
  public static formatWarning (addTimestamp: boolean, strTemplate: string, ...args:any[]):string {
    let logStr = replaceTemplate(strTemplate, args)
    if (addTimestamp) {
      logStr = '[' + dateToString.getDatetime() + ']:' + logStr
    }
    logStr = '<span style=\'color:orange\'>' + logStr + '</span><br>'
    return logStr
  }
}
