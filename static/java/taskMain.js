// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
const u1 = path.join(__dirname, '..', '..', 'app', 'node_modules', 'electron-re')
const u2 = path.join(__dirname, '..', '..', 'app', 'node_modules', 'java')
// const re = require('C:\\Program Files\\cc_data_link\\resources\\app\\node_modules\\electron-re')//dynamicallyRequire('electron-re')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const re = require(u1)
const ProcessHost = re.ProcessHost
// eslint-disable-next-line @typescript-eslint/no-var-requires
const java = require(u2)

const baseDir = path.join('C:\\Program Files\\DLTOpenJDK\\', 'dlt_db')

const dependencies = fs.readdirSync(baseDir)
dependencies.forEach(function (dependency) {
  java.classpath.push(baseDir + '/' + dependency)
})

ProcessHost.registry('connectTest', (args) => {
  try {
    test(args)
    return { code: 20000, result: '成功' }
  } catch (e) {
    console.log(e)
    return { code: 50000, result: process.env }
  }
})
function test (arg) {
  const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
  const service = new TableInputService()
  service.testConnectSync(JSON.stringify(arg))
}
