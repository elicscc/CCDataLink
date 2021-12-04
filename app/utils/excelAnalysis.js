import xlsx from 'xlsx'
import excel from 'exceljs'
export default {
  /**
   * @description: 根据文件路径获取excel表格数据数组
   * 1.使用判断是否CSV， 若是使用xlsx读取时需要转码
   * 2.选择读取sheet第一张表
   * 3.获取起始内容所在行数 若小于用户输入的表头所在行数则报错
   * 4.xlsx解析成json格式表头没有空行 若起始内容所在行数大于1 需要用户输入的所在行数减去起始内容所在行数获得正确的表头行
   * 5.xlsx读取出的合并的单元只有其左上第一个单元格有数据，需要用xlsx获取合并的单元格信息，遍历所有合并的单元格填充到每个单元格内确保都有数据
   * 6.使用xlsx解析合并单元格后的数据，返回表头和内容
   * @author: 招宝天尊
   * @param {*} path
   * @param {*} rowNumber
   */
  readExcelByFilePath: async function (path, rowNumber) {
    let excel
    // 判断是否CSV
    if (path.split('.').reverse()[0] === 'csv') {
      // todo 需要判断要不要转码 先写死了
      excel = await xlsx.readFile(path
        , { codepage: 936 }
      )
      // console.log(excel)
    } else {
      // todo 日志格式目前写死 xlsx不支持excel那样显示
      excel = await xlsx.readFile(path, { dateNF: 'yyyy-MM-dd HH:mm' })
    }
    debugger
    const ws = excel.Sheets[excel.SheetNames[0]]
    let addr, str
    // 获取表的内容范围
    let range = ws['!ref']
    if (range) {
      // 获取起始内容所在行数
      range = range.split(':')[0].replace(/[^0-9]/ig, '')
      if (rowNumber < range) {
        throw new Error('表头行内容为空！')
      }
      if (range > 1) {
        // xlsx解析成json格式表头没有空行，所有这里表头行数要对应处理一下
        rowNumber = rowNumber - range + 1
      }
    }
    // 获取合并的单元格信息
    const merges = ws['!merges']
    // 遍历合并单元格
    if (merges) {
      for (let i = 0; i < merges.length; i++) {
        str = null
        for (let R = merges[i].s.r; R <= merges[i].e.r; R++) {
          for (let C = merges[i].s.c; C <= merges[i].e.c; C++) {
            // Excel中的标识位
            addr = this.getExcelColumnName(C) + (1 + R)
            if (ws[addr]) {
              str = ws[addr]
            } else {
              // 添补合并的单元格
              if (str) {
                ws[addr] = str
              }
            }
          }
        }
      }
    }
    // 使用xlsx解析成json格式
    let worksheet = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false })
    // 去掉结尾的空行
    let newRow = 0
    for (let i = worksheet.length - 1; i > 0; i--) {
      if (worksheet[i].length !== 0) {
        newRow = i
        break
      }
    }
    worksheet = worksheet.slice(0, newRow + 1)
    // console.log(worksheet)
    const result = {}
    result.headArray = worksheet[rowNumber - 1]
    result.dataArray = worksheet.slice(rowNumber)
    return result
  },
  // 获取excel列标识名
  getExcelColumnName (index) {
    let colName = ''
    if (index >= 26) {
      colName = this.getExcelColumnName(index / 26 - 1)
      colName += String.fromCharCode(65 + index % 26)
    } else {
      colName += String.fromCharCode(65 + index)
    }
    return colName
  },
  /**
   * 通过模板路径获取表头，而后把数据写到指定文件里面
   * @param {*} rowArray 数组
   * @param {*} rowNumbers 行数
   * @param {*} templatePath 模板路径
   * @param {*} path 待写入的文件路径
   */
  insertDataToExcel: async function (rowArray, rowNumbers, templatePath, path) {
    const workbook = new excel.Workbook()
    await workbook.xlsx.readFile(templatePath)
    const worksheet = workbook.worksheets[0]
    // 起始行数,从起始行数的下一行开始插入数据，所以要 +1
    worksheet.insertRows(+rowNumbers + 1, rowArray, 'o')
    await workbook.xlsx.writeFile(path)
  },

  addDataToExcel: async function (rowArray, header, path) {
    const workbook = new excel.Workbook()
    workbook.created = new Date()
    workbook.modified = new Date()
    const worksheet = workbook.addWorksheet('sheet1')
    worksheet.addRow(header)
    worksheet.addRows(rowArray)
    await workbook.xlsx.writeFile(path)
  }

}
