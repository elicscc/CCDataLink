<template>
  <div
    @keydown.ctrl.shift="keyHandler"
    @keyup.110="keyHandler"
    @keyup.190="keyHandler"
  >
    <div style="padding-left:10px">
      <span style="padding-right:10px">当前数据库连接：{{dataBaseInfo.connectName}}</span>
      <el-button type="success" :disabled="!runComplete" size="small" style="margin-left:10px" @click="run()">
        <svg-icon icon-class="run" />
        运行
      </el-button>
      <el-button type="success" size="small" @click="stop()">
        <svg-icon icon-class="stop" />
        停止
      </el-button>
      <el-button  type="success" size="small" @click="save()">
        <svg-icon icon-class="skill" />
        保存
      </el-button>
      <el-button type="success" :disabled="!runComplete" size="small" @click="formatSql()">
        <svg-icon icon-class="format" />
        格式化
      </el-button>
      <span class="theme" style="float:right;width: 120px">
        <el-select :value="theme" size="small" placeholder="请选择主题" @change="setTheme">
          <el-option
            v-for="item in themeOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </span>
    </div>
    <split-pane
      split="horizontal"
      style="height: calc(100vh - 100px);margin-top: 15px;margin-bottom: 5px;"
      @resize="reInitEditor"
    >
      <template slot="paneL">
        <div
          ref="container"
          style="height: 100%;"
        />
      </template>
      <template slot="paneR">
        <div ref="getheight" style="height: 100%;">
          <Tabs type="card" :value="tab" :animated="false" v-if="sqlResultList.id">
            <TabPane
                v-show="sqlResultList.sql!=null"
                key="-1"
                label="message"
                name="-1"
            >
              <div v-if="sqlResultList.errorMessage">
                sql: {{ sqlResultList.sql }}<br/>
                报错：{{ sqlResultList.errorMessage }}
              </div>
              <div v-else>
                sql: {{ sqlResultList.sql }}<br/>
                <span v-show="sqlResultList.count">影响行：{{ sqlResultList.count }}<br/></span>
                time：{{ sqlResultList.time }}<br/>
              </div>
            </TabPane>
            <TabPane
                v-for="(sqlResult, index) in resultSet"
                :key="index"
                :label="'结果' + (index+1)"
                :name="'结果' + (index+1)"
            >
              <div>总条数： {{ sqlResult.count }}(仅展示前20条) 点此展示全部</div>
              <Table
                  :max-height="sqlSize"
                  :columns="sqlResult.columns"
                  :data="sqlResult.list"
                  size="small"
                  border
              ></Table>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </split-pane>
  </div>
</template>
<script>
import * as monaco from 'monaco-editor'
import SplitPane from 'vue-splitpane'
// import formatter from 'sql-formatter'
import min from '../../mixin/mixin'
import sqlAutocompleteParser from 'gethue/parsers/hiveAutocompleteParser'
import { remote } from 'electron'
const son = remote.getGlobal('son')

// import getSuggestions from '../../components/MonacoEditor/utils/suggestions'

export default {
  name: 'MyMonacoEditor',
  components: { SplitPane },
  mixins: [min],
  props: {
    insertTableName: {
      type: String,
      default: () => null
    },
    type: {
      type: Object,
      default () {
        return {}
      }
    },
    dataBaseInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    code: {
      type: String,
      default: () => 'write code here'
    },
    language: {
      type: String,
      default: function () {
        return 'sql'
      }
    },
    name: {
      type: String,
      default: () => null
    },
    id: {
      type: String,
      default: () => null
    }
  },
  data () {
    return {
      tab: null,
      resultSet: [],
      // tableColumn is look like this
      // tableColumn: {
      //   t1: ['column1_t1_1', 'column1_t1_2'],
      //   t2: ['column1_t2_1', 'column1_t2_2']
      // },
      tableColumn: {},
      sqlSize: 0,
      themeOption: [
        {
          value: 'vs',
          label: '白色主题'
        },
        {
          value: 'vs-dark',
          label: '黑色主题'
        }
      ],
      editor: null,
      languageCopy: 'sql',
      sqlResultList: {},
      pythonConsoleSize: -1,
      runResultLogType: null,
      // 执行是否完成
      runComplete: true,
      codeCopy: ''// 内容备份
    }
  },
  computed: {
    // sidebarOpened () {
    //   return this.$store.state.app.sidebar.opened
    // },
    // currentTabsName () {
    //   return this.$store.state.monaco.currentTabsName
    // },
    theme () {
      return this.$store.state.monaco.theme
    }
  },
  watch: {
    // 监听双击表名后insertTableName是否有变化,空字符串为旧值,传过来的为新值
    insertTableName (nev, old) {
      if (nev !== null) {
        const position = this.editor.getPosition()
        if (position !== null) {
          const sqlValue = this.editor.getValue()
          const sqlNums = sqlValue.split('\n')
          let sqlBeforeCursor = ''
          let sqlAfterCursor = ''
          for (let i = 0; i < sqlNums.length; i++) {
            if (i < (position.lineNumber - 1)) {
              sqlBeforeCursor += sqlNums[i] + '\n'
            }
            if (i === (position.lineNumber - 1)) {
              sqlBeforeCursor += sqlNums[i].substring(0, position.column - 1) + nev + sqlNums[i].substring(position.column - 1, sqlNums[i].length) + '\n'
            }
            if (i > (position.lineNumber - 1)) {
              sqlAfterCursor += sqlNums[i] + '\n'
            }
          }
          const sql = sqlBeforeCursor + sqlAfterCursor
          this.editor.getModel().setValue(sql)
        }
      }
    }
    // sidebarOpened: function (open) {
    //   const self = this
    //   setTimeout(function () {
    //     self.editor.layout()
    //   }, 300)
    // },
    // currentTabsName: function (name) {
    //   const self = this
    //   if (name === this.name) {
    //     self.editor.layout()
    //   }
    // }
  },
  mounted () {
    this.tableColumn = this.type
    this.languageCopy = this.language
    this.codeCopy = this.code
    this.initEditor()
  },
  methods: {
    convertResultSet (resultSet) {
      if (this.sqlResultList.errorMessage) {
        return
      }
      if (resultSet && resultSet.length) {
        for (let i = 0; i < resultSet.length; i++) {
          resultSet[i].count = resultSet[i].dataList.length
          resultSet[i].list = resultSet[i].dataList.slice(0, 20)
        }
        this.resultSet = resultSet
      }
    },
    // 根据sql语法解析提示信息
    resolveSuggestion (suggestInfo) {
      const self = this
      // 定义一个最终返回的提示信息的数组,并在解析每一类提示信息的时候讲提示信息push到这个数组中,最后返还此数组
      const monacoSuggestion = []
      // 添加关键字
      this.resolveSuggestKeywords(suggestInfo, monacoSuggestion)
      // 根据表名获取列名
      if (suggestInfo.suggestColumns && suggestInfo.suggestColumns.tables) {
        const tables = suggestInfo.suggestColumns.tables
        // console.log('tables is' + JSON.stringify(tables))
        for (let i = 0; i < tables.length; i++) {
          const table = tables[i]
          if (table.identifierChain) {
            let tableChainName = ''
            for (let j = 0; j < table.identifierChain.length; j++) {
              const identifier = table.identifierChain[j]
              if (identifier.name) {
                tableChainName += identifier.name + '.'
              }
            }
            if (tableChainName.length > 1) {
              self.resolveColumnSuggestionByTableName(
                tableChainName.substr(0, tableChainName.length - 1),
                monacoSuggestion
              )
            }
          }
        }
      }
      // 添加表名
      this.resolveSuggestTables(suggestInfo, monacoSuggestion)
      // 添加常用函数
      // this.resolveSuggestAggregateFunctions(suggestInfo, monacoSuggestion)
      return monacoSuggestion
    },
    resolveSuggestTables (suggestInfo, monacoSuggestion) {
      // 如果解析信息中没有出现suggestTables,则返回空
      if (!suggestInfo.suggestTables) {
        return
      }

      for (const key in this.tableColumn) {
        monacoSuggestion.push({
          label: key,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: key,
          detail: '表名'
        })
      }
    },
    // 根据sql语法解析提示关键字
    resolveSuggestKeywords (suggestInfo, monacoSuggestion) {
      if (!suggestInfo.suggestKeywords) {
        return
      }
      for (let i = 0; i < suggestInfo.suggestKeywords.length; i++) {
        const keyword = suggestInfo.suggestKeywords[i]
        monacoSuggestion.push({
          label: keyword.value,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword.value,
          detail: '关键字'
        })
      }
    },
    // 根据表名解析对应的列提示信息
    resolveColumnSuggestionByTableName (tableName, monacoSuggestion) {
      const columnList = this.tableColumn[tableName]
      if (!columnList) {
        return
      }
      for (let i = 0; i < columnList.length; i++) {
        const columnName = columnList[i]
        monacoSuggestion.push({
          label: columnName,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: columnName,
          detail: '表' + tableName
        })
      }
    },
    resolveSuggestAggregateFunctions (suggestInfo, monacoSuggestion) {
      if (suggestInfo.suggestAggregateFunctions) {
        const aggregateFunctions = [
          'COUNT()',
          'SUM()',
          'MAX()',
          'MIN()',
          'AVG()'
        ]
        for (let i = 0; i < aggregateFunctions.length; i++) {
          const f = aggregateFunctions[i]
          monacoSuggestion.push({
            label: f,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: f,
            detail: '函数'
          })
        }
      }
    },
    initEditor: function () {
      const self = this
      monaco.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: (model, position) => {
          const sqlValue = model.getValue()
          const lineNumber = position.lineNumber
          const column = position.column
          let beforeSqlIndex = 0
          for (let i = 0; i < lineNumber - 1; i++) {
            beforeSqlIndex = sqlValue.indexOf('\n', beforeSqlIndex)
          }
          beforeSqlIndex += column
          const sqlBeforeCursor = sqlValue.substring(0, beforeSqlIndex - 1)
          const sqlAfterCursor = ' ' + sqlValue.substring(beforeSqlIndex, sqlValue.length)
          // console.log(
          //   'before:' + sqlBeforeCursor + 'after:' + sqlAfterCursor + 'end'
          // )
          const suggestInfo = sqlAutocompleteParser.parseSql(
            sqlBeforeCursor,
            sqlAfterCursor,
            'hive',
            true
          )
          //  console.log('suggest info' + JSON.stringify(suggestInfo, null, 2))
          const columnSuggestion = self.resolveSuggestion(suggestInfo)
          return { suggestions: columnSuggestion }
        }
      })
      let language = self.languageCopy || self.language
      if (language.toLocaleLowerCase() === 'sparksql' || language.toLocaleLowerCase() === 'sql') {
        language = 'sql'
      }
      self.editor = monaco.editor.create(self.$refs.container, {
        value: self.codeCopy || self.code,
        language: language,
        theme: self.theme, // vs, hc-black, or vs-dark
        fontSize: 20 // 字体大小
      })
      self.editor.onDidChangeModelContent(function (event) { // 编辑器内容change事件
        self.codeCopy = self.editor.getValue()
      })
      // 编辑器随窗口自适应
      window.addEventListener('resize', function () {
        self.editor.layout()
      })
    },
    // 执行transform,并设置定时任务去获取日志
    async run () {
      this.sqlResultList = {}
      this.runComplete = false
      let transformCode = this.codeCopy || this.code
      const value = this.editor.getValue()
      const selection = this.editor.getSelection()
      const startPosition = selection.getStartPosition()
      const endPosition = selection.getEndPosition()
      if (!startPosition.equals(endPosition)) {
        const lineArray = value.split('\n')
        let firstLineSelection = ''
        let lastLineSelection = ''
        let middleLineSelection = ''
        const lineTotal = endPosition.lineNumber - startPosition.lineNumber
        if (startPosition.lineNumber === endPosition.lineNumber) {
          transformCode = lineArray[startPosition.lineNumber - 1].substring(startPosition.column - 1, endPosition.column)
        } else {
          firstLineSelection = lineArray[startPosition.lineNumber - 1].substring(startPosition.column - 1, lineArray[startPosition.lineNumber - 1].length)
          lastLineSelection = lineArray[endPosition.lineNumber - 1].substring(0, endPosition.column)
          for (let i = 0; i < lineTotal - 1; i++) {
            middleLineSelection += lineArray[startPosition.lineNumber + i].substring(0, lineArray[startPosition.lineNumber + i].length) + ' '
          }
          transformCode = firstLineSelection + middleLineSelection + lastLineSelection
        }
      }
      const uuid = this.getUUID()
      const database = JSON.stringify(this.dataBaseInfo)
      // console.log(database)
      const res = await son.send('exeSql', { databaseInfo: database, sql: transformCode, id: uuid })
      // console.log(res.result)
      this.runComplete = true
      this.sqlResultList = res.result.data
      this.sqlSize = this.$refs.getheight.offsetHeight - 70
      this.convertResultSet(this.sqlResultList.resultSet)
      if (this.resultSet && this.resultSet.length > 0) {
        this.tab = '结果1'
      }
      if (this.sqlResultList.errorMessage) {
        this.resultSet = []
        this.tab = '-1'
      }
    },
    stop () {
      this.$message.warning('未开发')
    },
    keyHandler () {
      // 快捷键触发monaco的自动提示补全功能
      console.log('trigger')
      this.editor.trigger('随便写点儿啥', 'editor.action.triggerSuggest', {})
    },
    save () {
      this.$message.warning('未开发')
      // const transformCode = this.codeCopy || this.code
    },
    formatSql () {
      this.$message.warning('未开发')
      // // this.editor.getAction(['editor.action.formatDocument'])._run()
      // this.codeCopy = formatter.format(this.codeCopy)
      // this.editor.setValue(this.codeCopy)
    },
    setTheme (currentTheme) {
      monaco.editor.setTheme(currentTheme)
      this.$store.dispatch('monaco/setMonacoTheme', currentTheme)
    },
    reInitEditor () {
      this.editor.dispose()
      this.initEditor()
      this.sqlSize = this.$refs.getheight.offsetHeight - 70
    }
  }
}
</script>
<style lang="scss">
.myEditor {
  margin-right: 15px;
  margin-left: 15px;
}
::v-deep .splitter-pane-resizer.horizontal{
    border-top: 2px solid #fff;
opacity:unset;
    height: 0;
}
.el-tabs__item{
  color: #dfe4ed;
}
</style>
