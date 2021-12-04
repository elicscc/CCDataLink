export default class ListUtil {
  /**
     * 解析list字符串
     * @param jsonStr
     * @param paramsLevel
     */
  public static analysis (listStr: any): Array<any> {
    const dataArray: any[] = []
    try {
      debugger
      const jsonObject = eval('(' + listStr + ')')
      for (let i = 0; i < jsonObject.length; i++) {
        const row = jsonObject[i]
        const rowData: { [k: string]: any } = {}
        for (let j = 0; j < row.length; j++) {
          rowData['字段' + (j + 1)] = row[j]
        }
        dataArray.push(rowData)
      }
    } catch (error) {
      dataArray.push('error')
      return dataArray
    }
    return dataArray
  }

  public static dataPreview (listStr: any): Array<any> {
    const dataArray: any[] = []
    try {
      debugger
      const jsonObject = eval('(' + listStr + ')')
      const length = jsonObject.length > 10 ? 10 : jsonObject.length
      for (let i = 0; i < length; i++) {
        const row = jsonObject[i]
        const rowData: { [k: string]: any } = {}
        for (let j = 0; j < row.length; j++) {
          rowData['字段' + (j + 1)] = row[j]
        }
        dataArray.push(rowData)
      }
    } catch (error) {
      dataArray.push('error')
      return dataArray
    }
    return dataArray
  }
}
