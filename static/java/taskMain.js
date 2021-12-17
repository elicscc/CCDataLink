// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
const b = process.env.NODE_ENV === 'production'
const u2 = b ? path.join(__dirname, '..', '..', 'app', 'node_modules', 'java') : 'java'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const java = require(u2)
const baseDir = b ? 'C:\\Program Files\\DLTOpenJDK\\dlt_db' : path.join(__dirname, '..', '..', 'static', 'dlt_db').replace(/\\/g, '\\\\')

const dependencies = fs.readdirSync(baseDir)
dependencies.forEach(function (dependency) {
  java.classpath.push(baseDir + '/' + dependency)
})

function handelMessage ({ action, params, id }) {
  let r
  switch (action) {
    case 'connectTest':
      try {
        r = test(params)
      } catch (e) {
        r = exception(e)
      }
      break
    case 'getTables':
      try {
        r = getTables(params)
      } catch (e) {
        r = exception(e)
      }
      break
    case 'getTableAndColumns':
      try {
        r = getTableAndColumns(params)
      } catch (e) {
        r = exception(e)
      }
      break
    case 'exeSql':
      try {
        r = exeSql(params.databaseInfo, params.sql, params.id)
      } catch (e) {
        r = exception(e)
      }
      break
  }
  process.send({ action, error: null, result: r, id })
}

function exception (e) {
  return {
    code: 50001,
    message: e.message
  }
}

function test (arg) {
  const TableInputService = java.import('com.cc.dlt.db.TableInputService')
  const service = new TableInputService()
  return JSON.parse(service.testConnectSync(JSON.stringify(arg)))
}

function getTables (arg) {
  const TableInputService = java.import('com.cc.dlt.db.TableInputService')
  const service = new TableInputService()
  return JSON.parse(service.getTableNamesSync(JSON.stringify(arg)))
}

function getTableAndColumns (arg) {
  const TableInputService = java.import('com.cc.dlt.db.TableInputService')
  const service = new TableInputService()
  return JSON.parse(service.getTableAndColumnsSync(JSON.stringify(arg)))
}

function exeSql (databaseInfoStr, sql, id) {
  const TableInputService = java.import('com.cc.dlt.db.TableInputService')
  const service = new TableInputService()
  return JSON.parse(service.exeSqlSync(databaseInfoStr, sql, id))
}

process.on('message', handelMessage)
