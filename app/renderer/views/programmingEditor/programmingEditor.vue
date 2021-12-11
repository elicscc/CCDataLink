<template>
  <div>
    <el-row :gutter="20">
      <!--左侧-->
      <el-col :span="5" :xs="24">
        <div style="margin-top:5px">

          <el-row :gutter="3">
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
                  @click="query"
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
            <el-tree
                ref="tree"
                :data="proOptions"
                node-key="id"
                lazy
                :load="loadNode"
                :props="defaultProps"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                @node-click="handleNodeClick"
                highlight-current
            >
              <span slot-scope="{ node, data }" :title="data.connectName">
                <svg-icon :icon-class="node.level === 1 ?'db': 'table'"/>
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
            @tab-remove="removeTab"
        >
          <el-tab-pane
              v-for="(item, index) in editorTabs"
              :key="item.name"
              :label="item.title"
              :name="item.name"
              :closable="item.close"
          >
            <monaco-editor
                v-if="item.key !== -1"
                :id="item.name"
                :type="item.type"
                :code="item.code"
                :language="item.language"
                :name="item.title"
                style="padding-bottom:10px"
                :insert-table-name="insertTableName"
            />
            <div v-else>{{ tableList }}</div>

          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <data-base-dialog :isVisible.sync="addDataBaseDialogVisible" @dataBaseDialog="dataBaseDialog"/>
  </div>
</template>

<script>
import DataBaseDialog from '../../components/dialog/addDataBaseDialog'
import MonacoEditor from '../../components/MonacoEditor'
import { uuid } from 'vue-uuid'
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
      selectId: null,
      tableList: null,
      addDataBaseDialogVisible: false,
      // 定义点击次数,默认0次
      treeClickCount: 0,
      insertTableName: '',
      showCloseTab: false,
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
  mounted () {
    this.getTreeList()
  },
  created () {
    this.editorTabs.push({
      key: -1,
      title: 'object',
      name: 'object',
      close: false
    })
    this.currentTabsName = this.getUUID()
  },
  methods: {
    dataBaseDialog (data) {
      const list = store.get('databaseList') || []
      if (!data.id) {
        const f = JSON.parse(JSON.stringify(data))
        f.id = this.getUUID()
        list.push(f)
      } else {
        const i = list.findIndex(item => item.id === data.id)
        if (i === -1) {
          list.push(data)
        } else {
          list.splice(i, 1, data)
        }
      }
      store.set('databaseList', list)
      this.getTreeList()
    },
    // 返回唯一标识
    getUUID () {
      return uuid.v1()
    },
    // 新增一个编辑器
    async query () {
      if (!this.selectId) {
        return this.$message.error('未选择数据库')
      }
      const item = this.proOptions.find(e => e.id === this.selectId)
      const res = await son.send('getTableAndColumns', item)
      console.log(res.result)
      if (res && res.result.code === 20000) {
        const uid = this.getUUID()
        this.editorTabs.push({
          title: 'search',
          name: uid,
          code: '',
          close: true,
          language: 'sql',
          type: res.result.data
        })
        this.currentTabsName = uid
      } else {
        return this.$message.error(res.result.message)
      }
    },
    removeTab (targetName) {
      const tabs = this.editorTabs
      let activeName = this.currentTabsName
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }

      this.currentTabsName = activeName
      this.editorTabs = tabs.filter(tab => tab.name !== targetName)
    },

    // 获取侧边栏树
    getTreeList () {
      this.proOptions = store.get('databaseList') || []
      console.log(this.proOptions)
    },
    // 筛选节点
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    async loadNode (node, resolve) {
      console.log(node)
      if (node.level === 1) {
        const res = await son.send('getTables', node.data)
        console.log(res.result)
        if (res.result.code !== 20000) {
          this.$message.error(res.result.message)
          return resolve([])
        }
        console.log(res.result)
        const s = res.result.data.map(i => {
          return { connectName: i.name }
        })
        return resolve(s)
      }
      if (node.level > 1) {
        return resolve([])
      }
    },
    handleNodeClick (data) {
      this.selectId = data.id
      // data.children = [
      //   { connectName: '/ss', label: 'sdads' }
      // ]
      //
      // console.log(data)
      //
      // console.log(this.proOptions)
      // const res = await son.send('getTables', data)
      // console.log(res)
      // this.tableList = res.result.result
      // this.currentTabsName = 'object'
      // console.log(this.keyId)
      // 记录点击次数
      // this.treeClickCount++
      // // 单次点击次数超过2次不作处理,直接返回,也可以拓展成多击事件
      // if (this.treeClickCount >= 2) {
      //   return
      // }
      // // 计时器,计算300毫秒为单位,可自行修改
      // this.timer = window.setTimeout(() => {
      //   if (this.treeClickCount === 1) {
      //     // 把次数归零
      //     this.treeClickCount = 0
      //     // 单击事件处理
      //   } else if (this.treeClickCount > 1) {
      //     // 把次数归零
      //     this.treeClickCount = 0
      //     // 双击事件
      //     this.insertTableName = data.label
      //   }
      // }, 300)
    }
  }
}
</script>
<style lang='scss' scoped>
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
