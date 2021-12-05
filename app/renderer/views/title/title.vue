<template>
  <el-container>
    <el-aside width="200px">
      <!-- 库中的所有表 -->
      <el-table :data="tableData" border stripe highlight-current-row :max-height="700" @cell-dblclick="tableDblClick">
        <el-table-column prop="table_name" label="表" width="190"></el-table-column>
      </el-table>
    </el-aside>
    <el-main style="padding:0px 20px 0px 20px">
      <el-button type="primary" @click="dialogFormVisible = true" plain>连接</el-button>
      <el-button type="primary" @click="query" plain :disabled="sql == '' || !connection">查询</el-button>
      <!-- Sql编辑器 -->
      <codemirror ref="cm" v-model="sql" :options="cmOptions" style="width:100%;margin:10px 0px 10px 0px;" @cursorActivity="selectionChange" @input="editorChanged"></codemirror>

      <!-- Sql 表展示 -->
      <el-button type="primary" plain v-bind:key="table" v-for="table in tables" @click="showTableCols(table)">{{table}}</el-button>

      <!-- 查询结果 -->
      <el-table :data="queryData" border stripe highlight-current-row style="width:100%;margin:10px 0px;" :max-height="350">
        <el-table-column v-bind:key="col.table+'_'+col.name" v-for="col in cols" :prop="col.name" :label="col.name" :width="150"></el-table-column>
      </el-table>
    </el-main>

    <!-- 连接弹框 -->
    <el-dialog title="新建连接" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="历史：" :label-width="formLabelWidth">
          <el-select v-model="linkSelectedValue" placeholder="请选择" @change="linkSelected" :disabled="users.length===0">
            <el-option v-for="user in users" :key="user.desc" :label="user.desc+' '+user.host" :value="user">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述：" :label-width="formLabelWidth">
          <el-input v-model="form.desc" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="IP地址：" :label-width="formLabelWidth">
          <el-input v-model="form.host" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="库名：" :label-width="formLabelWidth">
          <el-input v-model="form.database" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="端口：" :label-width="formLabelWidth">
          <el-input v-model="form.port" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户名：" :label-width="formLabelWidth">
          <el-input v-model="form.user" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码：" :label-width="formLabelWidth">
          <el-input type="password" v-model="form.pwd" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="linkToMysql()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 表结构弹框 -->
    <el-dialog :title="tableName" :visible.sync="dialogTableVisible" :show-close=true width="1000px">
      <el-table :data="tableColData" border stripe highlight-current-row style="width:100%;margin:10px 0px;" :max-height="400">
        <el-table-column v-bind:key="col.name" v-for="col in colCols" :prop="col.name" :label="col.name" :width="col.width"></el-table-column>
      </el-table>
    </el-dialog>
  </el-container>
</template>
<script>
import Store from 'electron-store'
const store = new Store()
export default {
  data () {
    return {
      formLabelWidth: '80px',
      dialogTableVisible: false,
      dialogFormVisible: false,
      form: {
        host: '',
        port: '3306',
        user: 'root',
        pwd: '',
        desc: '本地连接',
        database: ''
      },
      cmOptions: {
        tabSize: 4,
        mode: 'text/x-mysql',
        extraKeys: { 'Ctrl-Space': 'autocomplete' },
        lineNumbers: true,
        line: true,
        theme: 'ambiance',
        hintOptions: {
          completeSingle: false
        }
      },
      sql: 'select * from order_info',
      tableSql: 'select table_name,table_comment from information_schema.tables where table_schema=',
      colSql: 'select column_name,column_comment,column_default,is_nullable,data_type from information_schema.columns ',
      connection: undefined,
      queryData: [], // 查询结果
      cols: [], // 结果列
      tables: [], // sql中涉及的表
      tableData: [], // 库中所有的表
      tableDataTemp: [], // 库中所有的表备份
      tableColData: [], // 表结构数据
      tableFilter: '',
      colCols: [], // 表结构列
      curUser: {},
      users: (store.get('users') ? store.get('users') : []),
      tableName: '',
      linkSelectedValue: '',
      codemirror: undefined,
      doc: undefined
    }
  },
  name: 'login',
  mounted () {
    this.codemirror = this.$refs.cm.codemirror
    this.doc = this.$refs.cm.codemirror.getDoc()
  },
  methods: {
    linkToMysql () { // 连接到mysql
      const user = {
        host: this.form.host,
        database: this.form.database,
        user: this.form.user,
        password: this.form.pwd,
        desc: this.form.desc,
        port: this.form.port
      }
      this.curUser = user
      // 连接到数据库
      // this.connection = mysql.createPool(user)
      this.dialogFormVisible = false

      this.queryTables()
      this.storeConfig(user)
    },
    storeConfig (user) { // 保存配置
      const users = (store.get('users') ? store.get('users') : [])
      if (users && users.length > 0) {
        for (let index = 0; index < users.length; index++) {
          const ele = users[index]
          if (ele.desc !== user.desc) {
            users.push(user)
          } else {
            users[index] = user
          }
        }
      } else {
        users.push(user)
      }
      this.users = users
      store.set('users', users)
    },
    queryTables () { // 查询库中所有的表
      const $this = this
      console.log('queryTables : ' + this.tableSql + this.curUser.database)
      $this.tableData = ['sd', 'sd']
      $this.tableDataTemp = []
      // this.connection.query(
      //   this.tableSql + "'" + this.curUser.database + "'",
      //   function (err, results, fields) {
      //     if (err) {
      //       $this.msg(err)
      //     }
      //     $this.tableData = results
      //     $this.tableDataTemp = results
      //   }
      // )
    },
    queryTableCols (tableName) { // 查询表结构
      const $this = this
      console.log('queryTableCols : ' + this.colSql + "where table_name='" + tableName + "' and table_schema='" + this.curUser.database + "'")
      this.connection.query(
        this.colSql + "where table_name='" + tableName + "' and table_schema='" + this.curUser.database + "'",
        function (err, results, fields) {
          if (err) {
            $this.msg(err)
          }
          $this.tableColData = results
          $this.colCols = fields
          for (var index in $this.colCols) {
            if ($this.colCols[index].name === 'column_comment') {
              $this.colCols[index].width = 400
            }
            if ($this.colCols[index].name === 'column_name') {
              $this.colCols[index].width = 200
            }
          }
        }
      )
    },
    query () { // 查询sql
      const $this = this
      this.connection.query(
        this.sql + ' limit 50',
        function (err, results, fields) {
          if (err) {
            $this.msg(err)
          }
          $this.queryData = results
          $this.cols = fields

          $this.tables = []
          for (var i in fields) {
            if ($this.tables.indexOf(fields[i].orgTable) < 0) {
              $this.tables.push(fields[i].orgTable)
            }
          }
        }
      )
    },
    msg (msg) { // 系统提示
      this.$alert(msg)
    },
    showTableCols (table) { // 显示表结构
      this.tableName = table
      this.queryTableCols(table)
      this.dialogTableVisible = true
    },
    tableDblClick (colValue) { // 左侧列表双击事件，显示表结构
      this.tableName = colValue.table_name + ' ' + (colValue.table_comment ? colValue.table_comment : '')
      this.queryTableCols(colValue.table_name)
      this.dialogTableVisible = true
    },
    editorChanged () { // 编辑器输入事件
      console.log('editorChanged : ' + this.sql)
      console.log(this.doc.getCursor())
      // let sql = this.sql.toUpperCase()
    },
    selectionChange (doc) { // 选区变化事件
      if (doc.getSelection()) {
        console.log('selectionChange : ' + doc.getSelection())
      }
    },
    filterTable () {
      const $this = this
      if (this.tableFilter) {
        const data = []
        for (let index = 0; index < this.tableDataTemp.length; index++) {
          const el = this.tableDataTemp[index]
          if (el.table_name.indexOf(this.tableFilter) >= 0) {
            data.push(el)
          }
        }
        data.sort(function (a, b) {
          if (a.table_name.indexOf($this.tableFilter) < b.table_name.indexOf($this.tableFilter)) {
            return -1
          }
          if (a.table_name.indexOf($this.tableFilter) > b.table_name.indexOf($this.tableFilter)) {
            return 1
          }
          if (a.table_name.length < b.table_name.length) {
            return -1
          }
          if (a.table_name.length > b.table_name.length) {
            return 1
          }
          return 0
        })
        this.tableData = data
      } else {
        this.tableData = this.tableDataTemp
      }
    },
    linkSelected () {
      console.log(this.linkSelectedValue)
      this.form.desc = this.linkSelectedValue.desc
      this.form.host = this.linkSelectedValue.host
      this.form.database = this.linkSelectedValue.database
      this.form.port = this.linkSelectedValue.port
      this.form.user = this.linkSelectedValue.user
      this.form.pwd = this.linkSelectedValue.password
    }
  }
}
</script>
<style>

</style>
