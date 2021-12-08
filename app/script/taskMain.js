import java from 'java'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MessageChannel } = require('electron-re')
const msgc = MessageChannel
msgc.handle('test', (event, rsp) => {
  return msgc.invoke('app2', 'test2', rsp)
})
msgc.on('test_java', (event, args) => {
  console.log('接受到了')
  try {
    const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
    const service = new TableInputService()
    service.testConnectSync(JSON.stringify(args))
    msgc.sendTo(event.senderId, 'test_replay', { code: 20000, result: '成功' })
  } catch (e) {
    msgc.sendTo(event.senderId, 'test_replay', { error: 50000, result: e })
  }
})

// getTopTen: async function (dataBaseId: string, sql: string): Promise<any> {
//   if (!dataBaseId) {
//     throw new Error('数据库id为空！')
//   }
//   if (!sql) {
//     throw new Error('sql为空！')
//   }
//   const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
//   const service = new TableInputService()
//   const databaseInfo = await tempLogUtil.databaseIdCheck(dataBaseId)
//   databaseInfo.password = EncryptUtil.decrypt(databaseInfo.password)
//   return JSON.parse(service.selectTableInputTopTenSync(JSON.stringify(databaseInfo), sql))
// },
// /**
//  * 数据库表分页查询
//  * @param dataBaseId
//  * @param tableName
//  * @param current
//  * @param size
//  */
// getTables: async function (dataBaseId: string, tableName: string, current: number, size: number): Promise<any> {
//   if (!dataBaseId) {
//     throw new Error('数据库id为空！')
//   }
//   if (!current) {
//     throw new Error('页数为空！')
//   }
//   if (!size) {
//     throw new Error('分页大小为空！')
//   }
//   const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
//   const service = new TableInputService()
//   const databaseInfo = await tempLogUtil.databaseIdCheck(dataBaseId)
//   databaseInfo.password = EncryptUtil.decrypt(databaseInfo.password)
//   return JSON.parse(service.getTablePageSync(JSON.stringify(databaseInfo), tableName, current, size))
// },
// /**
//  *查询表所在的页数
//  * @param dataBaseId
//  * @param tableName
//  * @param size
//  */
// getTableNum: async function (dataBaseId: string, tableName: string, size: number): Promise<any> {
//   if (!dataBaseId) {
//     throw new Error('数据库id为空！')
//   }
//   if (!tableName) {
//     throw new Error('表名为空！')
//   }
//   if (!size) {
//     throw new Error('分页大小为空！')
//   }
//   const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
//   const service = new TableInputService()
//   const databaseInfo = await tempLogUtil.databaseIdCheck(dataBaseId)
//   databaseInfo.password = EncryptUtil.decrypt(databaseInfo.password)
//   return JSON.parse(service.getTableNumSync(JSON.stringify(databaseInfo), tableName, size))
// },
// /**
//  * 获取列分页查询
//  * @param dataBaseId
//  * @param tableName
//  */
// getColumns: async function (dataBaseId: string, tableName: string): Promise<any> {
//   if (!dataBaseId) {
//     throw new Error('数据库id为空！')
//   }
//   if (!tableName) {
//     throw new Error('表名为空！')
//   }
//   const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
//   const service = new TableInputService()
//   const databaseInfo = await tempLogUtil.databaseIdCheck(dataBaseId)
//   databaseInfo.password = EncryptUtil.decrypt(databaseInfo.password)
//   return JSON.parse(service.getColumnsPageSync(JSON.stringify(databaseInfo), tableName))
// }
