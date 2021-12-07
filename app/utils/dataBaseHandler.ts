import java from 'java'
import log4j from './log4j'

const logger = log4j.getLogger()
export default {
  /**
   * 测试数据库连接
   * @param databaseInfo
   */
  testConnect: function (databaseInfo: any): void {
    const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
    const service = new TableInputService()
    service.testConnectSync(JSON.stringify(databaseInfo))
  },
  /**
   *执行sql语句
   * @param uuid
   * @param databaseInfo
   * @param sql
   */
  executeSql: function (uuid: string, databaseInfo: any, sql: string): Promise<any> {
    if (!sql) {
      return
    }
    const databaseService = this.initDatabaseService(JSON.stringify(databaseInfo), uuid)
    return databaseService.executeSqlSync(sql)
  },

  /**
   * initial database service
   * 调用java方法,初始化数据库服务 避免频繁连接数据库
   * @param databaseInfoStr
   * @param uuid
   */
  initDatabaseService: function (databaseInfoStr: string, uuid: string): any {
    const DatabaseInfoServiceCache = java.import('com.dataqiao.dlt.db.DataBaseServiceCache')
    logger.info('import success', DatabaseInfoServiceCache)
    const service = DatabaseInfoServiceCache.getDatabaseServiceSync(databaseInfoStr, null, null, null, uuid, null)
    logger.info('new success', service)
    return service
  }
  // /**
  //  * 表输入组件预览用,返回10条数据
  //  * @param dataBaseId
  //  * @param sql
  //  */
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

}
