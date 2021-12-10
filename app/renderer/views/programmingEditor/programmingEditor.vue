<template>
  <div>
    <el-row :gutter="20"  >
      <!--左侧-->
      <el-col :span="5" :xs="24">
        <div style="margin-top:5px">

            <el-row :gutter="3" >
              <el-col :span="1.5">
                <el-button
                    icon="el-icon-plus"
                    size="mini"
                    type="primary"
                    @click="addDataBaseDialogVisible=true"
                />
              </el-col>
              <el-col :span="1.5">
                <el-button
                    icon="el-icon-search"
                    size="mini"
                    type="primary"
                />
              </el-col>
              <el-col :span="1.5">
                <el-button
                    icon="el-icon-refresh-right"
                    size="mini"
                    type="primary"
                    @click="getTreeList"
                />
              </el-col>
            </el-row>
          </div>
        <div class="head-container">
          <div class="tree">
            <!-- 转换的列表 -->
            <!-- <el-tree
              v-if="type === 1"
              ref="tree"
              highlight-current
              :data="proOptions"
              :props="defaultProps"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              default-expand-all
              @node-click="handleNodeClick"
            >
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <svg-icon v-if="data.children" icon-class="project" />
                <svg-icon v-else icon-class="job" />
                {{ node.label }}
              </span>
            </el-tree> -->
            <!-- 数据分析的列表 -->
            <el-tree
              ref="tree"
              highlight-current
              :data="proOptions"
              :props="defaultProps"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
            >
              <span slot-scope="{ node, data }"  :title="data.connectName">
                <svg-icon icon-class="project" />
                {{ data.connectName }}
              </span>
            </el-tree>
          </div>
        </div>
      </el-col>
      <!--右侧-->
      <el-col :span="19" :xs="24">
        <el-tabs
          v-model="currentTabsName"
          style="border-left: 1px solid #797979;"
          type="card"
          :closable="showCloseTab"
          @tab-click="clickTabs"
        >
          <el-tab-pane
            v-for="(item, index) in editorTabs"
            :key="index"
            :lazy="true"
            :label="item.title"
            :name="item.name"
          >
            <monaco-editor
              v-if="type === 1"
              :id="item.name"
              :code="item.code"
              :language="item.language"
              :name="item.title"
              style="padding-bottom:10px"
              :insert-table-name="insertTableName"
            />
            <monaco-editor
              v-else
              :id="item.name"
              :type="2"
              :code="item.code"
              :language="item.language"
              :name="item.title"
              style="padding-bottom:10px"
              :insert-table-name="insertTableName"
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <data-base-dialog  :isVisible.sync="addDataBaseDialogVisible" @dataBaseDialog="dataBaseDialog" />
  </div>
</template>

<script>
import DataBaseDialog from '../../components/dialog/addDataBaseDialog'
import MonacoEditor from '../../components/MonacoEditor'
import * as monaco from 'monaco-editor'
import getSuggestions from '../../components/MonacoEditor/utils/suggestions'
import sqlAutocompleteParser from 'gethue/parsers/hiveAutocompleteParser'
import electron from 'electron'
import Store from 'electron-store'
const son = electron.remote.getGlobal('son')
const store = new Store()

export default {
  components: { MonacoEditor, DataBaseDialog },
  props: {
    type: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      addDataBaseDialogVisible: false,
      // 定义点击次数,默认0次
      treeClickCount: 0,
      insertTableName: '',
      showCloseTab: false,
      // tableColumn is look like this
      // tableColumn: {
      //   t1: ['column1_t1_1', 'column1_t1_2'],
      //   t2: ['column1_t2_1', 'column1_t2_2']
      // },
      tableColumn: {},
      currentTabsName: null,
      editorTabs: [],
      treeExpandedKeys: [],

      // 树结构配置
      defaultProps: {
        children: 'children',
        label: 'connectName'
      },
      // 侧边栏数据
      proOptions: []
    }
  },
  computed: {
    suggestionsInitial () {
      return this.$store.state.monaco.suggestionsInitial
    }
  },

  created () {
    // SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mx' ORDER BY TABLE_SCHEMA, TABLE_NAME
    this.getTreeList()
    this.initTableColumn()
    // this.addEditor(this.$route.query, this.type)
    this.showCloseTab = false
    const uuid = this.getUUID()
    this.editorTabs.push({
      title: 'sql1',
      name: uuid,
      code: '',
      language: 'sql'
    })
    this.currentTabsName = uuid
    // 只能初始化一次,避免重复初始化自动提示的内容

    console.log('suggestionsInitial', this.$store.state.monaco.suggestionsInitial)
    const self = this
    if (this.suggestionsInitial === false) {
      this.$store.dispatch('monaco/setSuggestionsInitial', true)

      // 多个代码编辑页面只需要全局注册一次提示项,所以放到这里
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
          const sqlAfterCursor =
            ' ' + sqlValue.substring(beforeSqlIndex, sqlValue.length)
          console.log(
            'before:' + sqlBeforeCursor + 'after:' + sqlAfterCursor + 'end'
          )
          const suggestInfo = sqlAutocompleteParser.parseSql(
            sqlBeforeCursor,
            sqlAfterCursor,
            'hive',
            true
          )
          console.log('suggest info' + JSON.stringify(suggestInfo, null, 2))
          const columnSuggestion = self.resolveSuggestion(suggestInfo)
          return { suggestions: columnSuggestion }
        }
      })
      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: () => {
          return {
            suggestions: JSON.parse(
              JSON.stringify(getSuggestions().pythonSuggestions)
            )
          }
        }
      })
    }
  },
  methods: {
    dataBaseDialog (data) {
      const list = (store.get('databaseList') ? store.get('databaseList') : [])
      list.push(data)
      store.set('databaseList', list)
      this.getTreeList()
    },
    // 返回唯一标识
    getUUID () {
      return Math.random().toString(36).substr(3, 10)
    },
    // 新增一个编辑器
    async addEditor (item, type) {
      if (type === 1) {
        // const res = await get('/transformInfo/queryDetail', {
        //   transformInfoId: item.id
        // })
        // if (res.code === 20000) {
        //   this.editorTabs.push({
        //     title: res.data.name,
        //     name: res.data.id,
        //     code: res.data.transformCode,
        //     language: res.data.toolType.toLocaleLowerCase()
        //   })
        //   this.currentTabsName = res.data.id
        // }
      }
      if (type === 2) {
        this.showCloseTab = false
        const uuid = this.getUUID()
        this.editorTabs.push({
          title: '数据分析',
          name: uuid,
          code: '',
          language: 'sql'
        })
        this.currentTabsName = uuid
      }
    },
    clickTabs (tab) {
      this.$store.dispatch('monaco/setCurrentTabsName', tab.name)
    },
    removeTab (targetName) {
      this.editorTabs = this.editorTabs.filter(
        (tab) => tab.name !== targetName
      )
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
        console.log('tables is' + JSON.stringify(tables))
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
      this.resolveSuggestAggregateFunctions(suggestInfo, monacoSuggestion)
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
    // 获取侧边栏树
    getTreeList () {
      this.proOptions = store.get('databaseList') ? store.get('databaseList') : []
      console.log(this.proOptions)
    },
    // 筛选节点
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    // handleNodeClick(data) {
    //   const transformInfo = this.proOptions.find((e) => e.id === data.id)
    //   if (transformInfo != null) return
    //   // 判断有重复的直接打开页面 没有再新增
    //   const checkee = this.editorTabs.find((e) => {
    //     return e.name === data.id
    //   })
    //   if (checkee) {
    //     this.currentTabsName = data.id
    //   } else {
    //     this.addEditor(data, this.type)
    //   }
    // },
    handleNodeClick (data) {
      // 记录点击次数
      this.treeClickCount++
      // 单次点击次数超过2次不作处理,直接返回,也可以拓展成多击事件
      if (this.treeClickCount >= 2) {
        return
      }
      // 计时器,计算300毫秒为单位,可自行修改
      this.timer = window.setTimeout(() => {
        if (this.treeClickCount === 1) {
          // 把次数归零
          this.treeClickCount = 0
          // 单击事件处理
        } else if (this.treeClickCount > 1) {
          // 把次数归零
          this.treeClickCount = 0
          // 双击事件
          this.insertTableName = data.label
        }
      }, 300)
    },
    initTableColumn () {
      // get('/transformInfo/queryAllTableInfo').then((res) => {
      //   const tableInfos = res.data
      //   tableInfos.forEach((tableInfo) => {
      //     const tableName = tableInfo.tableName
      //     this.tableColumn[tableName] = tableInfo.tableColumns.map(
      //       (column) => column.name
      //     )
      //   })
      // })
    }
  }
}
</script>
<style  lang='scss' scoped>
.left_title {
  font-weight: 650;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
}
.el-tree {
  min-width: 100%;
  font-size: 14px;
  display: inline-block;
}
.tree {
  overflow-y: auto;
  overflow-x: auto;
  height: calc(100vh - 245px);
}
//::v-deep
//  .el-tree--highlight-current
//  .el-tree-node.is-current
//  > .el-tree-node__content {
//  background-color: #606266;
//}
//::v-deep .el-tree-node__content:hover {
//  background-color: #66b1ff87;
//}
// 滚动条样式
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: #e0e3e7;
  height: 20px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
