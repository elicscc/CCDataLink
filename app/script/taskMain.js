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

ProcessHost.registry('connectTest', (args) => {
  try {
    test(args)
    return { code: 20000, result: '成功' }
  } catch (e) {
    console.log(e)
    return { code: 50000, result: e.message }
  }
})
function test (arg) {
  const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
  const service = new TableInputService()
  service.testConnectSync(JSON.stringify(arg))
}
