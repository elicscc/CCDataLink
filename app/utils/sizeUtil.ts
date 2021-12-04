/*
 * @Author:招宝天尊
 * @Date: 2020-11-09 18:00:51
 * @LastEditTime: 2020-11-11 16:47:26
 * @LastEditors: Please set LastEditors
 * @Description: 文件大小工具类
 * @FilePath: \DataLinkPlatform\app\utils\sizeUtil.js
 */
export default {
  /**
   *文件大小数值转化成B、KB、MB、GB
   * @param size 文件大小数值
   */
  sizeToStr: function (size: number) :string {
    let data = ''
    if (size < 0.1 * 1024) { // 如果小于0.1KB转化成B
      data = size.toFixed(2) + 'B'
    } else if (size < 0.1 * 1024 * 1024) { // 如果小于0.1MB转化成KB
      data = (size / 1024).toFixed(2) + 'KB'
    } else if (size < 0.1 * 1024 * 1024 * 1024) { // 如果小于0.1GB转化成MB
      data = (size / (1024 * 1024)).toFixed(2) + 'MB'
    } else { // 其他转化成GB
      data = (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
    }
    const sizeStr = data + ''
    const len = sizeStr.indexOf('.')
    const dec = sizeStr.substr(len + 1, 2)
    if (dec === '00') { // 当小数点后为00时 去掉小数部分
      return sizeStr.substring(0, len) + sizeStr.substr(len + 3, 2)
    }
    return sizeStr
  }
}
