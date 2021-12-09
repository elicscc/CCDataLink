// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ProcessHost } = require('electron-re')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const java = require('java')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
let baseDir
if (process.env.EXECUTOR || process.env.NODE_ENV === 'development') {
  baseDir = path.join(getStaticPath(), 'dlt_db')
} else {
  baseDir = path.join('C:\\Program Files\\DLTOpenJDK\\dlt_db')
}
const dependencies = fs.readdirSync(baseDir)
dependencies.forEach(function (dependency) {
  java.classpath.push(baseDir + '/' + dependency)
})

function getStaticPath () {
  if (process.env.EXECUTOR) {
    return path.resolve(path.join('.', '/static')).replace(/\\/g, '\\\\')
  } else if (process.env.NODE_ENV === 'production') {
    return path.join(__dirname, '..', '..', '..', '/static').replace(/\\/g, '\\\\')
  } else {
    return path.join(__dirname, '..', '..', '/static').replace(/\\/g, '\\\\')
  }
}
//
// const msgc = MessageChannel
// console.log('start mianjs')
// // msgc.handle('test', (event, rsp) => {
// //   console.log('接受')
// //   return msgc.invoke('app2', 'test2', rsp)
// // })
// msgc.on('test_java', (event, args) => {
//   console.log('接受到了')
//   try {
//     // const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
//     // const service = new TableInputService()
//     // service.testConnectSync(JSON.stringify(args))
//     msgc.sendTo(event.senderId, 'test_replay', { code: 20000, result: '成功' })
//   } catch (e) {
//     msgc.sendTo(event.senderId, 'test_replay', { error: 50000, result: e })
//   }
// })

// 获取主线程中的消息
// process.on('message', (args) => {
//   try {
//     test(args)
//     process.send({ code: 20000, result: '成功' })
//   } catch (e) {
//     console.log(e)
//     process.send({ code: 50000, result: e })
//   }
// })
ProcessHost.registry('test1', (args) => {
  try {
    test(args)
    return { code: 20000, result: '成功' }
  } catch (e) {
    return { code: 50000, result: e }
  }
})
function test (arg) {
  const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
  const service = new TableInputService()
  service.testConnectSync(JSON.stringify(arg))
}
