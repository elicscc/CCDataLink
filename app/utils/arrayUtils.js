/**
 * @description: js数组工具方法
 * @param {type}
 * @return {type}
 * @author: 腾蛇
 * @lastEditors: 腾蛇
 * @date: Do not edit
 * @lastEditTime: Do not edit
 */
import ping from 'ping'

export default {
  arrayFilter: function (array) {
    array = array.filter(item => item !== null && item !== undefined)
    return array
  },
  /**
   * 比较字符串相似度
   * @param {*} x
   * @param {*} y
   */
  compare: function (x, y) {
    let z = 0
    // 判断是否为字符串
    if (typeof x === 'string') {
      x = x.split('')
      y = y.split('')
    }
    const s = x.length + y.length
    x.sort()
    y.sort()
    let a = x.shift()
    let b = y.shift()
    while (a !== undefined && b !== undefined) {
      if (a === b) {
        z++
        a = x.shift()
        b = y.shift()
      } else if (a < b) {
        a = x.shift()
      } else if (a > b) {
        b = y.shift()
      }
    }
    return z / s * 200
  },
  pingIp: async function (ip, port) {
    let flag = false
    const res = await ping.promise.probe(ip)
    if (res) {
      flag = res.alive
    }
    return flag
  }
}
