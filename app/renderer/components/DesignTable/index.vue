<template>
  <div ref="designRef" style="height: 100vh;">
    <el-row style="margin-left: 5px">
      <el-button type="primary" size="small" @click="save">保存</el-button>
      <el-button type="primary" size="small" @click="insertField" v-show="tabValue==='Fields'">新增字段</el-button>
      <el-button type="primary" size="small" v-show="tabValue==='Fields'">删除字段</el-button>
      <el-button type="primary" size="small" @click="insertIndex" v-show="tabValue==='Indexes'">新增索引</el-button>
      <el-button type="primary" size="small" v-show="tabValue==='Indexes'">删除索引</el-button>
    </el-row>
    <el-tabs type="border-card" v-model="tabValue" style="margin-top:10px" :before-leave="beforeLeave">
      <el-tab-pane
          key="Fields"
          label="字段"
          name="Fields"
      >
        <el-table
            :max-height="maxSize"
            :data="tableData"
            border
            key="Fields"
            resizable
            highlight-current-row
            @row-click="rowClick"
            size="small"
        >
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="radioId" :label="scope.row.id" size="mini"></el-radio>
            </template>
          </el-table-column>
          <el-table-column label="字段名称" align="center" prop="name">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="mini" type="text"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="类型" align="center" prop="type">
            <template slot-scope="scope">
              <el-select v-model="scope.row.type" size="mini" filterable @change="typeChange(scope.row)">
                <el-option
                    v-for="item in typeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="长度" align="center" prop="length">
            <template slot-scope="scope">
              <el-input v-model="scope.row.length" type="number" size="mini"
                        oninput="value=value.replace(/[^\d]/g,'')"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="小数" align="center" prop="decimal">
            <template slot-scope="scope">
              <el-input v-model="scope.row.decimal" type="number" size="mini"
                        oninput="value=value.replace(/[^\d]/g,'')"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="非空" align="center" prop="notNull">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.notNull" size="mini"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="虚拟" align="center" prop="virtual">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.virtual" size="mini"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="主键" align="center" prop="key">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.key" size="mini" @change="keyChange(scope)"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="注释" align="center" prop="comment">
            <template slot-scope="scope">
              <el-input v-model="scope.row.comment" type="text" size="mini"></el-input>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top:30px">
          <el-row class="rowPadding" v-show="fieldData.virtual">
            <el-col :span="5" class="title">虚拟类型</el-col>
            <el-col :span="8">
              <el-select v-model="fieldData.virtualType" size="mini" style="width:200px">
                <el-option
                    v-for="item in virtualTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row class="rowPadding"
                  v-show="fieldData.virtual">
            <el-col :span="5" class="title">表达式</el-col>
            <el-col :span="8">
              <el-input v-model="fieldData.expression" type="text" size="mini" style="width:200px"></el-input>
            </el-col>
          </el-row>
          <el-row class="rowPadding" v-show="fieldData.virtual">
            <el-col :span="5" class="title">总是产生</el-col>
            <el-col :span="8">
              <el-checkbox v-model="fieldData.generatedAlways" size="mini"></el-checkbox>
            </el-col>
          </el-row>
          <el-row class="rowPadding">
            <el-col :span="5" class="title">默认值：</el-col>
            <el-col :span="8">
              <el-select v-model="fieldData.default" size="mini" filterable allow-create default-first-option
                         :disabled="fieldData.virtual"
                         style="width:200px">
                <el-option
                    v-for="item in defaultValueList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="8">
              提示：手动输入默认值按回车保存
            </el-col>
          </el-row>
          <el-row class="rowPadding"
                  v-show="fieldData.type && (fieldData.type.indexOf('char') !== -1 || fieldData.type.indexOf('text') !== -1)">
            <el-col :span="5" class="title">主键长度：</el-col>
            <el-col :span="8">
              <el-input v-model="fieldData.keyLength" type="number" size="mini" style="width:200px"
                        oninput="value=value.replace(/[^\d]/g,'')" :disabled="!fieldData.key"></el-input>
            </el-col>
          </el-row>
          <div v-show="fieldData.type && (fieldData.type.indexOf('int') !== -1)">
            <el-row class="rowPadding" v-show="!fieldData.virtual">
              <el-col :span="5" class="title">自动增长</el-col>
              <el-col :span="8">
                <el-checkbox v-model="fieldData.autoIncrement" size="mini"></el-checkbox>
              </el-col>
            </el-row>
            <el-row class="rowPadding">
              <el-col :span="5" class="title">无符号</el-col>
              <el-col :span="8">
                <el-checkbox v-model="fieldData.unsigned" size="mini"></el-checkbox>
              </el-col>
            </el-row>
            <el-row class="rowPadding">
              <el-col :span="5" class="title">零值填充</el-col>
              <el-col :span="8">
                <el-checkbox v-model="fieldData.zeroFill" size="mini"></el-checkbox>
              </el-col>
            </el-row>
          </div>
          <el-row class="rowPadding" v-show="!fieldData.virtual && fieldData.type && (fieldData.type === 'datetime')">
            <el-col :span="5" class="title">当前时间更新</el-col>
            <el-col :span="8">
              <el-checkbox v-model="fieldData.onUpdateCurrentTime" size="mini"></el-checkbox>
            </el-col>
          </el-row>
        </div>

      </el-tab-pane>
      <el-tab-pane
          key="Indexes"
          label="索引"
          name="Indexes"
      >
        <el-table
            :max-height="maxSize"
            :data="indexesTableData"
            border
            highlight-current-row
            @row-click="indexRowClick"
            size="small"
        >
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="indexesRadioId" :label="scope.row.id" size="mini"></el-radio>
            </template>
          </el-table-column>
          <el-table-column label="名字" align="center" prop="name">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="mini" type="text"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="数据列" align="center" prop="fields">
            <template slot-scope="scope">
              <el-select multiple v-model="scope.row.fields" size="mini" filterable>
                <el-option
                    v-for="item in tableData"
                    :key="item.id"
                    :label="'`'+item.name+'`'"
                    :value="'`'+item.name+'`'"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="索引类型" align="center" prop="indexType">
            <template slot-scope="scope">
              <el-select v-model="scope.row.indexType" size="mini" clearable>
                <el-option
                    v-for="item in indexTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="索引方法" align="center" prop="indexMethod">
            <template slot-scope="scope">
              <el-select v-model="scope.row.indexMethod" size="mini" clearable>
                <el-option
                    v-for="item in indexMethodList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="注释" align="center" prop="comment">
            <template slot-scope="scope">
              <el-input v-model="scope.row.comment" type="text" size="mini"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane
          key="comment"
          label="注释"
          name="comment"
      >
        <el-input v-model="tableComment" type="textarea"
                  :rows="50"></el-input>
      </el-tab-pane>
      <el-tab-pane
          key="SQL Preview"
          label="SQL预览"
          name="SQL Preview"
      >
        <pre>
        <code>{{ sqlPre }}</code>
          </pre>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { remote } from 'electron'
import mix from '../../mixin/mixin'
import Constant from '../../../utils/constant'

const son = remote.getGlobal('son')

export default {
  name: 'designTable',
  mixins: [mix],
  props: {
    databaseInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    tableName: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      tableDataCopy: [],
      tableNameCopy: null,
      tableComment: null,
      fieldData: {},
      radioId: null,
      indexesRadioId: null,
      loading: false,
      tableData: [],
      sqlPre: null,
      maxSize: 0,
      tabValue: 'Fields',
      indexesTableData: [],
      indexesTableDataCopy: [],
      defaultValueList: [
        {
          label: 'EMPTY STRING',
          value: '\'\''
        },
        {
          label: 'NULL',
          value: 'NULL'
        }
      ],
      virtualTypeList: [
        {
          label: 'PERSISTENT',
          value: 'PERSISTENT'
        },
        {
          label: 'VIRTUAL',
          value: 'VIRTUAL'
        }
      ],
      validRules: {
        name: [
          {
            required: true,
            message: '名称必须填写'
          }
        ]
      },
      typeList: [],
      indexTypeList: [
        {
          label: 'FULLTEXT',
          value: 'FULLTEXT'
        },
        {
          label: 'NORMAL',
          value: ''
        },
        {
          label: 'SPATIAL',
          value: 'SPATIAL'
        },
        {
          label: 'UNIQUE',
          value: 'UNIQUE'
        }
      ],
      indexMethodList: [
        {
          label: 'BTREE',
          value: 'BTREE'
        },
        {
          label: 'HASH',
          value: 'HASH'
        },
        {
          label: 'RTREE',
          value: 'RTREE'
        }
      ]
    }
  },
  async mounted () {
    this.tableNameCopy = this.tableName
    await this.initEditor()
    switch (this.databaseInfo.databaseType) {
      case '1':
      case '4':
        this.typeList = Constant.MYSQL_TYPE_LIST
        break
      case '2':
        this.typeList = []
        break
      case '3':
        this.typeList = []
        break
    }
    this.$nextTick().then(() => {
      this.maxSize = this.$refs.designRef.offsetHeight - 400
    })
    if (!this.tableNameCopy) {
      this.insertField()
      this.insertIndex()
    }
  },

  methods: {
    rowClick (row) {
      this.radioId = row.id
      this.fieldData = row
    },
    beforeLeave (activeName) {
      if (activeName === 'SQL Preview') {
        if (!this.tableNameCopy) {
          this.getCreateSqlPre(this.tableNameCopy)
        }
      }
    },
    indexRowClick (row) {
      this.indexesRadioId = row.id
    },

    insertField () {
      const uid = this.getUUID()
      this.tableData.push({
        id: uid,
        name: '',
        type: 'varchar',
        length: 255,
        decimal: null,
        notNull: null,
        virtual: null,
        key: null,
        comment: null,
        virtualType: null,
        expression: null,
        generatedAlways: null,
        default: null,
        keyLength: null,
        autoIncrement: null,
        unsigned: null,
        zeroFill: null,
        onUpdateCurrentTime: null
      })
      this.rowClick(this.tableData[this.tableData.length - 1])
    },
    insertIndex () {
      const uid = this.getUUID()
      this.indexesTableData.push({
        id: uid,
        name: '',
        fields: null,
        indexType: null,
        indexMethod: null,
        comment: null
      })
      this.indexesRadioId = uid
    },
    keyChange (value) {
      if (value.row.key) {
        value.row.notNull = true
      }
    },

    save () {
      this.$prompt('请输入表名', '表命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[^\s]*$/,
        inputErrorMessage: '不能含有空格'
      }).then(async ({ value }) => {
        if (!value) {
          return this.$message({
            type: 'info',
            message: '已取消'
          })
        }
        this.getCreateSqlPre(value)
        // console.log(this.sqlPre)
        const database = JSON.stringify(this.databaseInfo)
        // console.log(database)
        const res = await son.send('exeUpdateSql', { databaseInfo: database, sql: this.sqlPre })
        //  console.log(res.result)
        if (res.result.data.errorMessage) {
          this.$message({
            type: 'error',
            message: res.result.data.errorMessage
          })
        } else if (res.result.data.count >= 0) {
          this.$message({
            type: 'success',
            message: '创建成功'
          })
          this.tableNameCopy = value
          await this.initEditor()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },

    /**
     * 初始化编辑表结构配置
     */
    async  initEditor () {
      if (!this.tableNameCopy) {
        return
      }
      this.sqlPre = null
      const database = JSON.stringify(this.databaseInfo)
      const res = await son.send('getTableInfo', { databaseInfo: database, tableName: this.tableNameCopy })
      console.log(res.result)
      this.tableData = res.result.data.columnList.map(i => {
        if (res.result.data.databaseType !== '2') {
          return {
            /**
             * COLLATION_NAME: null
             * COLUMN_COMMENT: ""
             * COLUMN_DEFAULT: null
             * COLUMN_KEY: "PRI"
             * COLUMN_NAME: "asdd"
             * COLUMN_TYPE: "int(255)"
             * EXTRA: "auto_increment"
             * IS_NULLABLE: "NO"
             * PRIVILEGES: "select,insert,update,references"
             */
            id: this.getUUID(),
            name: i.COLUMN_NAME,
            notNull: i.IS_NULLABLE === 'NO',
            key: i.COLUMN_KEY === 'PRI',
            comment: i.COLUMN_COMMENT,
            default: i.COLUMN_DEFAULT,
            ...this.getColumnInfo(i, res.result.data.databaseType)
          }
        }
      })
      this.tableDataCopy = JSON.parse(JSON.stringify(this.tableData))
      this.tableData.length > 0 && this.rowClick(this.tableData[0])
      this.tableComment = this.getTableComment(res.result.data.createSql)
    },
    getColumnInfo (data, type) {
      if (type !== '2') {
        const ty = data.COLUMN_TYPE.split('(')
        let l = null
        let dec = null
        let t = null
        if (ty.length > 1) {
          t = ty[0]
          let fi = ty[1].replace(')', '')
          fi = fi.split(',')
          if (fi.length > 1) {
            l = fi[0]
            dec = fi[1]
          } else {
            l = fi[0]
          }
        } else {
          t = ty
        }
        return {
          type: t,
          length: l,
          decimal: dec
        }
      }
    },
    tableCommentEscape (str) {
      if (!str) {
        return ';'
      }
      return 'COMMENT = \'' + this.commentEscape(str) + ' \';'
    },
    fieldCommentEscape (str) {
      if (!str) {
        return ''
      }
      return 'COMMENT \'' + this.commentEscape(str) + ' \''
    },
    commentEscape (str) {
      if (!str) {
        return ''
      }
      return str.replace(/"/g, '\\"').replace(/'/g, '\\\'')
    },
    typeChange (row) {
      row.default = null
      row.keyLength = null
      row.autoIncrement = null
      row.unsigned = null
      row.zeroFill = null
      row.onUpdateCurrentTime = null
    },
    getCreateSqlPre (tableName) {
      switch (this.databaseInfo.databaseType) {
        case '1':
        case '4':
          this.mysqlCreatePre(tableName)
          break
        case '2':
          break
        case '3':
          break
      }
    },

    mysqlCreatePre (tableName) {
      tableName = tableName || ''
      let col = ''
      let ind = ''
      let pk = ''
      const pkList = []
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].name) {
          const n = '`' + this.tableData[i].name + '`'
          if (this.tableData[i].key && this.tableData[i].name) {
            const keyL = this.tableData[i].keyLength ? n + '(' + this.tableData[i].keyLength + ')' : n
            pkList.push(keyL)
          }
          const name = this.tableData[i].name ? n : ''
          const decimal = this.tableData[i].decimal > 0 ? ',' + this.tableData[i].decimal : ''
          const length = this.tableData[i].length > 0 ? '(' + this.tableData[i].length + decimal + ')' : ''
          col += name + ' ' + this.tableData[i].type + length + ' ' + this.mysqlColumnExInfo(this.tableData[i]) + ' ' + this.fieldCommentEscape(this.tableData[i].comment) + (i < this.tableData.length - 1 ? ',\n' : '')
        }
      }
      for (let i = 0; i < this.indexesTableData.length; i++) {
        if (this.indexesTableData[i].name) {
          const n = '`' + this.indexesTableData[i].name + '`'
          const indexType = this.indexesTableData[i].indexType ? this.indexesTableData[i].indexType + ' INDEX' : 'INDEX'
          const indexMethod = this.indexesTableData[i].indexMethod ? ' USING ' + this.indexesTableData[i].indexMethod : ''
          const fields = this.indexesTableData[i].fields ? '(' + this.indexesTableData[i].fields + ')' : '()'
          ind += indexType + ' ' + n + fields + indexMethod + ' ' + this.fieldCommentEscape(this.indexesTableData[i].comment) + (i < this.indexesTableData.length - 1 ? ',\n' : '')
        }
      }
      if (pkList.length > 0) {
        pk += 'PRIMARY KEY ' + '(' + pkList.toString() + ')'
      }
      const com = this.tableCommentEscape(this.tableComment)
      this.sqlPre = 'CREATE TABLE `' + this.databaseInfo.databaseName + '`.`' + tableName + '`  (\n' + col + (pk ? ',\n' : '') + pk + (ind ? ',\n' : '') + ind + '\n)' + com
    },
    mysqlColumnExInfo (data) {
      let r
      if (data.virtual) {
        const g = data.generatedAlways ? 'GENERATED ALWAYS' : ''
        r = g + 'AS (' + data.expression + ') ' + data.virtualType
      } else {
        const u = data.unsigned ? 'UNSIGNED ' : ''
        const z = data.zeroFill ? 'ZEROFILL ' : ''
        const n = data.notNull ? 'NOT NULL ' : 'NULL'
        const d = data.default ? 'DEFAULT ' + data.default + ' ' : ''
        const a = data.autoIncrement ? 'AUTO_INCREMENT ' : ''
        const t = data.onUpdateCurrentTime ? 'ON UPDATE CURRENT_TIMESTAMP ' : ''
        r = u + z + n + d + a + t
      }
      return r
    },
    /**
     *解析表的comment
     * @param str
     * @returns {null|*}
     */
    getTableComment (str) {
      str = str.substring(str.lastIndexOf(')') + 1, str.length)
      if (str.match(/COMMENT='(\S*?)'/)) {
        return str.match(/COMMENT='(\S*?)'/)[1]
      } else {
        return null
      }
    }
  }

}
</script>
<style lang="scss">
.custom-radio {
  font-size: 18px;
  cursor: pointer;
  user-select: none;
}

.rowPadding {
  margin-top: 10px;
}
</style>
