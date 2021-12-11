// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
const b = process.env.NODE_ENV === 'production'
const u1 = b ? path.join(__dirname, '..', '..', 'app', 'node_modules', 'electron-re') : 'electron-re'
const u2 = b ? path.join(__dirname, '..', '..', 'app', 'node_modules', 'java') : 'java'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const re = require(u1)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const java = require(u2)
const ProcessHost = re.ProcessHost
const baseDir = b ? 'C:\\Program Files\\DLTOpenJDK\\dlt_db' : path.join(__dirname, '..', '..', 'static', 'dlt_db').replace(/\\/g, '\\\\')

const dependencies = fs.readdirSync(baseDir)
dependencies.forEach(function (dependency) {
  java.classpath.push(baseDir + '/' + dependency)
})

ProcessHost.registry('connectTest', (args) => {
  try {
    test(args)
    return { code: 20000, result: '成功' }
  } catch (e) {
    return { code: 50000, result: e.message }
  }
}).registry('getTables', (args) => {
  try {
    const r = getTables(args)
    return { code: 20000, result: r }
  } catch (e) {
    return { code: 50000, result: e.message }
  }
})
function test (arg) {
  const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
  const service = new TableInputService()
  service.testConnectSync(JSON.stringify(arg))
}

function getTables (arg) {
  const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
  const service = new TableInputService()
  return JSON.parse(service.getTableNamesSync(JSON.stringify(arg), null))
}
