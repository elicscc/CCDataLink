/*
 * @Author: your name
 * @Date: 2020-11-03 14:45:30
 * @LastEditTime: 2020-11-11 16:52:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \DataLinkPlatform\app\utils\dateToString.js
 */
/**
 * 处理日期工具方法
 */

export default {
  dateToString: function (date) {
    const year = date.getFullYear()
    let month = (date.getMonth() + 1).toString()
    let day = date.getDate().toString()
    if (month.length === 1) {
      month = '0' + month
    }
    if (day.length === 1) {
      day = '0' + day
    }
    let hours = date.getHours().toString()
    if (hours.length === 1) {
      hours = '0' + hours
    }
    let minute = date.getMinutes().toString()
    if (minute.length === 1) {
      minute = '0' + minute
    }
    let second = date.getSeconds().toString()
    if (second.length === 1) {
      second = '0' + second
    }

    const dateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minute + ':' + second
    return dateTime
  },
  /**
 * 时间戳转日期格式
 * @param {*} time  时间戳
 */
  getDate: function (time) {
    var now = new Date(time)
    var y = now.getFullYear()
    var m = now.getMonth() + 1
    var d = now.getDate()
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + now.toTimeString().substr(0, 8)
  },
  /**
* 时间转日期格式
* @param {*} dateInfo  时间
*/
  dateStr: function (dateInfo) {
    const date = new Date(dateInfo)
    const year = date.getFullYear()
    let month = (date.getMonth() + 1).toString()
    let day = date.getDate().toString()
    if (month.length === 1) {
      month = '0' + month
    }
    if (day.length === 1) {
      day = '0' + day
    }
    let hours = date.getHours().toString()
    if (hours.length === 1) {
      hours = '0' + hours
    }
    let minute = date.getMinutes().toString()
    if (minute.length === 1) {
      minute = '0' + minute
    }
    let second = date.getSeconds().toString()
    if (second.length === 1) {
      second = '0' + second
    }

    return year + '-' + month + '-' + day + ' ' + hours + ':' + minute + ':' + second
  },

  getDatetime: function () {
    const date = new Date()
    return this.dateToString(date)
  },

  getDateFormat (format) {
    let dateTime = ''
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    if (month < 10) {
      month = '0' + month
    }
    if (day < 10) {
      day = '0' + day
    }
    switch (format) {
      case '1':
        dateTime = year + '年' + month + '月' + day + '日'
        break
      case '2':
        dateTime = year + '/' + month + '/' + day
        break
      case '3':
        dateTime = year + '-' + month + '-' + day
        break
      default:
        dateTime = year + '-' + month + '-' + day
    }
    return dateTime
  },
  getTimeFormat (format) {
    let dateTime = ''
    const date = new Date()
    let hours = date.getHours()
    let hours1 = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    if (hours < 10) {
      hours1 = '0' + hours1
    }
    if (minute < 10) {
      minute = '0' + minute
    }
    if (second < 10) {
      second = '0' + second
    }
    switch (format) {
      case '1':
        dateTime = hours1 + '时' + minute + '分' + second + '秒'
        break
      case '2':
        dateTime = hours1 + ':' + minute + ':' + second
        break
      case '3':
        if (hours > 12) {
          hours -= 12
          dateTime = hours + ':' + minute + ':' + second + ' PM'
        } else {
          dateTime = hours + ':' + minute + ':' + second + ' AM'
        }
        break
      default:
        dateTime = hours1 + ':' + minute + ':' + second
    }
    return dateTime
  }
}
