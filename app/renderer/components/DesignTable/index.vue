<template>
  <div ref="designRef" style="height: 100vh;">
    <el-row style="margin-left: 5px">
      <el-button type="primary" size="small" @click="save">保存</el-button>
      <el-button type="primary" size="small" @click="insertField" v-show="tabValue==='Fields'">新增字段</el-button>
      <el-button type="primary" size="small" @click="deleteField" v-show="tabValue==='Fields'">删除字段</el-button>
      <el-button type="primary" size="small" @click="insertIndex" v-show="tabValue==='Indexes'">新增索引</el-button>
      <el-button type="primary" size="small" @click="deleteIndex" v-show="tabValue==='Indexes'">删除索引</el-button>
      <el-button type="primary" size="small" @click="getCreateSql" v-show="tableNameCopy">查看create</el-button>
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
          <!--          <el-table-column label="索引类型" align="center" prop="indexType">-->
          <!--            <template slot-scope="scope">-->
          <!--              <el-select v-model="scope.row.indexType" size="mini" clearable>-->
          <!--                <el-option-->
          <!--                    v-for="item in indexTypeList"-->
          <!--                    :key="item.value"-->
          <!--                    :label="item.label"-->
          <!--                    :value="item.value"-->
          <!--                ></el-option>-->
          <!--              </el-select>-->
          <!--            </template>-->
          <!--          </el-table-column>-->
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
          <!--          <el-table-column label="关键字块大小" align="center" prop="keyBlockSize">-->
          <!--            <template slot-scope="scope">-->
          <!--              <el-input v-model="scope.row.keyBlockSize" type="number" size="mini"></el-input>-->
          <!--            </template>-->
          <!--          </el-table-column>-->
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
      tableCommentCopy: null,
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
        } else {
          this.sqlPre = this.getChangeSqlPre()
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
        // indexType: null,
        // keyBlockSize: null,
        indexMethod: null,
        comment: null

      })
      this.indexesRadioId = uid
    },

    deleteField () {
      if (this.radioId) {
        const index = this.tableData.findIndex((e) => {
          return e.id === this.radioId
        })
        // 假设没有找到
        if (index === -1) {
          return console.log('删除失败')
        }
        // 删除元素
        this.tableData.splice(index, 1)
        this.tableData.length > 0 && this.rowClick(this.tableData[this.tableData.length - 1])
      }
    },

    deleteIndex () {
      if (this.indexesRadioId) {
        const index = this.indexesTableData.findIndex((e) => {
          return e.id === this.indexesRadioId
        })
        // 假设没有找到
        if (index === -1) {
          return console.log('删除失败')
        }
        // 删除元素
        this.indexesTableData.splice(index, 1)
        this.indexesTableData.length > 0 && this.indexRowClick(this.indexesTableData[this.indexesTableData.length - 1])
      }
    },

    keyChange (value) {
      if (value.row.key) {
        value.row.notNull = true
      }
    },

    async save () {
      if (!this.tableNameCopy) {
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
          const res = await son.send('exeUpdateSql', {
            databaseInfo: database,
            sql: this.sqlPre
          })
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
      } else {
        const sql = this.getChangeSqlPre()
        if (!sql) {
          return
        }
        const database = JSON.stringify(this.databaseInfo)
        // console.log(database)
        const res = await son.send('exeUpdateSql', {
          databaseInfo: database,
          sql: this.sqlPre
        })
        //  console.log(res.result)
        if (res.result.data.errorMessage) {
          this.$message({
            type: 'error',
            message: res.result.data.errorMessage
          })
        } else if (res.result.data.count >= 0) {
          this.$message({
            type: 'success',
            message: '修改成功'
          })
          await this.initEditor()
        }
      }
    },
    async getCreateSql () {
      if (this.databaseInfo.databaseType === '2') {
        return this.$message.warning('暂不支持sqlserver')
      }
      const database = JSON.stringify(this.databaseInfo)
      const res = await son.send('showCreateSql', {
        databaseInfo: database,
        tableName: this.tableNameCopy
      })
      await this.$alert('<pre><code>' + res.result.data + '</code></pre>', '建表语句', {
        dangerouslyUseHTMLString: true
      })
    },
    /**
     * 初始化编辑表结构配置
     */
    async initEditor () {
      if (!this.tableNameCopy) {
        return
      }
      this.sqlPre = null
      const database = JSON.stringify(this.databaseInfo)
      const res = await son.send('getTableInfo', {
        databaseInfo: database,
        tableName: this.tableNameCopy
      })
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
             * COLUMN_TYPE: "int(255) unsigned zerofill"
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
            ...this.getColumnInfo(i, res.result.data.databaseType, res.result.data.indexList)
          }
        }
      })
      const arr = res.result.data.indexList.filter(i => i.INDEX_NAME !== 'PRIMARY')
      const map = {}
      const dest = []
      for (let i = 0; i < arr.length; i++) {
        const ai = arr[i]
        if (!map[ai.INDEX_NAME]) {
          dest.push({
            /**
             * CARDINALITY: "0"
             * COLLATION: "A"
             * COLUMN_NAME: "asd"
             * COMMENT: ""
             * IGNORED: "NO"
             * INDEX_COMMENT: "asdd' "
             * INDEX_NAME: "a"
             * INDEX_TYPE: "BTREE"
             * NON_UNIQUE: "1"
             * NULLABLE: ""
             * PACKED: null
             * SEQ_IN_INDEX: "1"
             * SUB_PART: null
             * TABLE_NAME: "test_t"
             */
            id: this.getUUID(),
            name: ai.INDEX_NAME,
            comment: ai.INDEX_COMMENT,
            indexMethod: ai.INDEX_TYPE,
            fields: ['`' + ai.COLUMN_NAME + '`']
          })
          map[ai.INDEX_NAME] = ai
        } else {
          for (let j = 0; j < dest.length; j++) {
            const dj = dest[j]
            if (dj.name === ai.INDEX_NAME) {
              dj.fields.push('`' + ai.COLUMN_NAME + '`')
              break
            }
          }
        }
      }
      this.indexesTableData = dest
      this.tableDataCopy = JSON.parse(JSON.stringify(this.tableData))
      this.indexesTableDataCopy = JSON.parse(JSON.stringify(this.indexesTableData))
      this.tableData.length > 0 && this.rowClick(this.tableData[0])
      this.indexesTableData.length > 0 && this.indexRowClick(this.indexesTableData[0])
      this.tableComment = this.getTableComment(res.result.data.createSql)
      this.tableCommentCopy = JSON.parse(JSON.stringify(this.tableComment))
    },
    getColumnInfo (data, type, indexList) {
      if (type !== '2') {
        let unsigned = false
        let zerofill = false
        const s = data.COLUMN_TYPE.split(' ')
        if (s.length > 1) {
          for (let i = 1; i < s.length; i++) {
            if (s[i] === 'unsigned') {
              unsigned = true
            } else if (s[i] === 'zerofill') {
              zerofill = true
            }
          }
        }
        const ty = s[0].split('(')
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
          t = ty[0]
        }
        // 获取主键长度
        /**
         * indexList: Array(2)
         * 0: {…}
         * 1:
         * CARDINALITY: "0"
         * COLLATION: "A"
         * COLUMN_NAME: "sd"
         * COMMENT: ""
         * IGNORED: "NO"
         * INDEX_COMMENT: ""
         * INDEX_NAME: "PRIMARY"
         * INDEX_TYPE: "BTREE"
         * NON_UNIQUE: "0"
         * NULLABLE: ""
         * PACKED: null
         * SEQ_IN_INDEX: "2"
         * SUB_PART: "6"
         * TABLE_NAME: "sdada"
         * get CARDINALITY: ()=>
         * @type {null}
         */
        let keyLen = null
        if (data.COLUMN_KEY === 'PRI') {
          const d = indexList.find(item => item.COLUMN_NAME === data.COLUMN_NAME)
          keyLen = d.SUB_PART
        }
        // data.EXTRA
        return {
          type: t,
          length: l,
          decimal: dec,
          zeroFill: zerofill,
          unsigned: zerofill,
          keyLength: keyLen
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

    getChangeSqlPre () {
      let sql
      switch (this.databaseInfo.databaseType) {
        case '1':
        case '4':
          sql = this.mysqlChangePre()
          break
        case '2':
          break
        case '3':
          break
      }
      return sql
    },
    /**
     * ALTER TABLE `test_cc`.`test_t`
     * DROP COLUMN `h`,
     * DROP COLUMN `r`,
     * CHANGE COLUMN `asd` `asdsdd` timestamp(0) NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP AFTER `sdd`,
     * MODIFY COLUMN `sds` bigint(255) NOT NULL AFTER `asdsdd`,
     * ADD COLUMN `re` varchar(255) NULL COMMENT 'dd' AFTER `sds`,
     * ADD COLUMN `sa` varchar(255) NULL COMMENT '787' AFTER `re`,
     * DROP PRIMARY KEY,
     * ADD PRIMARY KEY (`sdd`, `asdsdd`, `sds`) USING BTREE,
     * DROP INDEX `asd`,
     * DROP INDEX `a`,
     * ADD INDEX `asddd`(`sds`, `sa`) USING BTREE COMMENT 'sd',
     * ADD INDEX `b`(`sds`, `re`),
     *  COMMENT = 'zxczxc';
     */
    mysqlChangePre () {
      let sql = ''
      let com = ''
      let index = ''
      const table = ''
      // 对比tableData
      const addTableArr = this.tableData.filter((item) => {
        return this.tableDataCopy.findIndex(e => e.id === item.id) === -1
      }) || []
      const delTableArr = this.tableDataCopy.filter((item) => {
        return this.tableData.findIndex(e => e.id === item.id) === -1
      }) || []
      console.log('addTableArr', addTableArr)
      console.log('delTableArr', delTableArr)
      // 对比index
      const addIndexArr = this.indexesTableData.filter((item) => {
        return this.indexesTableDataCopy.findIndex(e => e.id === item.id) === -1
      }) || []
      const delIndexArr = this.indexesTableDataCopy.filter((item) => {
        return this.indexesTableData.findIndex(e => e.id === item.id) === -1
      }) || []
      // console.log('addIndexArr', addIndexArr)
      // console.log('delIndexArr', delIndexArr)
      // 如果修改index了则分别添加到add和del里面
      this.indexesTableData.forEach(t => {
        this.indexesTableDataCopy.forEach(f => {
          if (t.id === f.id && JSON.stringify(t) !== JSON.stringify(f)) {
            addIndexArr.push(t)
            delIndexArr.push(t)
          }
        })
      })
      let dropIndex = ''
      let addIndex = ''
      for (let i = 0; i < delIndexArr.length; i++) {
        dropIndex += 'DROP INDEX `' + delIndexArr[i].name + '`' + (i < delIndexArr.length - 1 ? ',\n' : '')
      }
      for (let i = 0; i < addIndexArr.length; i++) {
        if (addIndexArr[i].name) {
          const n = '`' + addIndexArr[i].name + '`'
          const indexMethod = addIndexArr[i].indexMethod ? ' USING ' + addIndexArr[i].indexMethod : ''
          const fields = addIndexArr[i].fields ? '(' + addIndexArr[i].fields + ')' : '()'
          addIndex += 'ADD INDEX ' + n + fields + indexMethod + ' ' + this.fieldCommentEscape(addIndexArr[i].comment) + (i < addIndexArr.length - 1 ? ',\n' : '')
        }
      }
      index = dropIndex + (dropIndex ? ',\n' : '') + addIndex

      // 对比comment
      if (this.tableComment !== this.tableCommentCopy) {
        com = 'COMMENT = ' + this.tableComment
      }
      sql = 'ALTER TABLE `' + this.databaseInfo.databaseName + '`.`' + this.tableNameCopy + '`\n' + table + index + com
      return sql
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
          // const indexType = this.indexesTableData[i].indexType ? this.indexesTableData[i].indexType + ' INDEX' : 'INDEX'
          const indexMethod = this.indexesTableData[i].indexMethod ? ' USING ' + this.indexesTableData[i].indexMethod : ''
          const fields = this.indexesTableData[i].fields ? '(' + this.indexesTableData[i].fields + ')' : '()'
          // const keyBlockSize = this.indexesTableData[i].keyBlockSize ? ' KEY_BLOCK_SIZE = ' + this.indexesTableData[i].keyBlockSize : ''
          ind += 'INDEX ' + n + fields + indexMethod + ' ' + this.fieldCommentEscape(this.indexesTableData[i].comment) + (i < this.indexesTableData.length - 1 ? ',\n' : '')
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
