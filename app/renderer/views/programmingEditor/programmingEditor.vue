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
                @node-contextmenu="rightClick"
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
      selectDatabaseId: null,
      tableList: null,
      addDataBaseDialogVisible: false,
      // 定义点击次数,默认0次
      treeClickCount: 0,
      timer: null,
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
    if (this.proOptions.length > 0) {
      // 'nextTick()' 下次dom更新时触发回调函数
      // 默认点击
      this.$nextTick().then(() => {
        const firstNode = document.querySelector('.el-tree-node')
        firstNode.click()
      })
    }

    this.editorTabs.push({
      key: -1,
      title: '对象',
      name: 'object',
      close: false
    })
    this.currentTabsName = 'object'
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
      if (!this.selectDatabaseId) {
        return this.$message.error('未选择数据库')
      }
      const item = this.proOptions.find(e => e.id === this.selectDatabaseId)
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
      // console.log(this.proOptions)
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
        // console.log(res.result)
        if (res.result.code !== 20000) {
          this.$message.error(res.result.message)
          return resolve([])
        }
        const self = this
        const s = res.result.data.map(i => {
          return { connectName: i.name, id: self.getUUID(), type: 'table' }
        })
        node.data.isConnected = true
        return resolve(s)
      }
      if (node.level > 1) {
        return resolve([])
      }
    },
    rightClick (event, data, e, element) {
      this.$refs.tree.setCurrentKey(data.id)

      this.selectDatabaseId = data.type === 'table' ? e.parent.data.id : data.id

      // console.log(this.selectDatabaseId)
    },

    refreshNode (id) {
      const node = this.$refs.tree.getNode(id)
      //  设置未进行懒加载状态
      node.loaded = false
      // 重新展开节点就会间接重新触发load达到刷新效果
      node.expand()
    },
    handleNodeClick (data, e) {
      // console.log(e)
      this.selectDatabaseId = data.type === 'table' ? e.parent.data.id : data.id
      // console.log(this.selectDatabaseId)
      this.treeClickCount++
      if (this.treeClickCount >= 2) {
        // 超过2次点击的事件
        return
      }
      // 计时器,计算300毫秒为单位,可自行修改
      this.timer = window.setTimeout(() => {
        // 把次数归零
        this.treeClickCount = 0
        if (this.treeClickCount === 1) {
          // 单击事件处理
        } else if (this.treeClickCount > 1) {
          // 双击事件处理
          if (e.expanded) {
            if (!data.isConnected) {
              this.refreshNode(data.id)
            } else {
              e.expanded = false
            }
          } else {
            this.refreshNode(data.id)
          }
        }
      }, 300)
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
  user-select:none;
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
