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
                  @click="openDataBaseDialog"
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
            <!--            <el-col :span="1.5">-->
            <!--              <el-button-->
            <!--                  icon="el-icon-refresh-right"-->
            <!--                  size="mini"-->
            <!--                  type="primary"-->
            <!--                  @click="getTreeList"-->
            <!--              />-->
            <!--            </el-col>-->
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
            <div  v-if="item.key === -1" style="height: calc(100vh - 80px);margin-top: 3px;margin-bottom: 5px;">
              <el-row style="margin-left: 5px">
                <el-button type="primary" size="small" :disabled="selectTables.length===0" @click="openTable">打开表</el-button>
                <el-button type="primary" size="small" :disabled="selectTables.length===0" @click="designTable">设计表</el-button>
                <el-button type="primary" size="small" :disabled="!selectDatabaseId" @click="addTable">新增表</el-button>
              </el-row>
              <div class="result-box">
                <vue-drag-select
                    v-model="selectTables"
                    value-key="connectName"
                    :item-margin="[3, 3, 3, 3]"
                    :item-height="40"
                    :item-width="160"
                    :warpper-padding="[0,0,0,0]"
                    ref="dragSelect"
                >
                  <template v-for="(item, index) in tableList">
                    <drag-select-option :key="item.id" :value="item" :item-index="index">
                      <div class="item-self">
                        <el-tag style="width: 100%;" :key="item.connectName" @click="tableEvent(item.connectName)">{{ item.connectName }}</el-tag>
                      </div>
                    </drag-select-option>
                  </template>
                </vue-drag-select>
              </div>
            </div>
            <table-list v-else-if="item.tagType === -2"
                        :tableName="item.title"
                        :databaseInfo="item.dataBaseInfo"
            />
            <div v-else-if="item.tagType === -3">设计表</div>
            <monaco-editor
                v-else
                :id="item.name"
                :type="item.type"
                :code="item.code"
                :dataBaseInfo="item.dataBaseInfo"
                :language="item.language"
                :name="item.title"
                style="padding-bottom:10px"
                :insert-table-name="insertTableName"
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <el-dialog
        title="数据库连接"
        :visible.sync="addDataBaseDialogVisible"
        :show-close="true"
        width="50%"
        top="50"
        :close-on-click-modal="false"
        :modal="false"
        v-dialogDrag
        @close="addDataBaseDialogVisible = false"
    >
      <!-- 新增数据库弹窗 -->
      <div>
        <Form
            ref="dataBaseInfo"
            :model="dataBaseInfo"
            :rules="dataBaseInfoRules"
            :label-width="100"
        >
          <Row>
            <Col span="18" offset="3" style="margin-top: 20px">
              <FormItem label="连接名称:" prop="connectName" class="title">
                <Input v-model="dataBaseInfo.connectName" placeholder="请输入连接名称" maxlength="30"></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="18" offset="3">
              <FormItem label="数据库类型:" prop="databaseType" class="title">
                <Select v-model="dataBaseInfo.databaseType" style="width:100%;text-align:left;" clearable
                        placeholder="请选择数据库类型">
                  <Option v-for="item in databaseTypeList" :value="item.value" :key="item.value">{{
                      item.label
                    }}
                  </Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="18" offset="3">
              <FormItem label="数据库地址:" prop="databaseAddress" class="title">
                <Input v-model="dataBaseInfo.databaseAddress" placeholder="请输入数据库地址" maxlength="30"></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="18" offset="3">
              <FormItem label="数据库名称:" prop="databaseName" class="title">
                <Input v-model="dataBaseInfo.databaseName" placeholder="请输入数据库名称" maxlength="30"></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="18" offset="3">
              <FormItem label="端口号:" prop="port" class="title">
                <Input v-model="dataBaseInfo.port" placeholder="请输入端口号" maxlength="30"></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="18" offset="3">
              <FormItem label="用户名:" prop="username" class="title">
                <Input v-model="dataBaseInfo.username" placeholder="请输入用户名" maxlength="30"></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="18" offset="3">
              <FormItem label="密码:" prop="password" class="title">
                <Input v-model="dataBaseInfo.password" placeholder="请输入密码" maxlength="30" type="password"
                       password></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="18" offset="3">
              <FormItem label="数据库说明:" prop="databaseDescription" class="title">
                <Input v-model="dataBaseInfo.databaseDescription" type="textarea" :rows="3" maxlength="300"
                       show-word-limit></Input>
              </FormItem>
            </Col>
          </Row>
          <Row style="margin-left:12.5%;">
            <el-button size="mini" type="primary" style="margin-left:100px;" @click="connectTest('dataBaseInfo')"
                       :loading="testConnectShow">连接测试
            </el-button>
          </Row>
        </Form>
        <el-row class="bottomSide rowPadding">
          <el-col :span="3" :offset="16">
            <el-button @click="addDataBaseDialogVisible = false" size="small">取 消</el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="primary" @click="saveDatabaseInfo('dataBaseInfo')" size="small">确 定</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import MonacoEditor from '../../components/MonacoEditor'
import TableList from '../../components/TableList'
import mix from '../../mixin/mixin'
import { remote } from 'electron'
import Store from 'electron-store'

const { Menu, MenuItem } = remote
const son = remote.getGlobal('son')
const store = new Store()

export default {
  components: { MonacoEditor, TableList },
  mixins: [mix],
  props: {
    type: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      selectTables: [],
      testConnectShow: false,
      dataBaseInfo: {
        connectName: '',
        databaseType: '1',
        databaseAddress: 'localhost',
        databaseName: '',
        port: '3306',
        username: 'root',
        password: '',
        databaseDescription: ''
      },
      dataBaseInfoRules: {
        connectName: [{ required: true, message: ' ', trigger: 'blur' }],
        databaseType: [{ required: true, message: ' ', trigger: 'change' }],
        databaseAddress: [{ required: true, message: ' ', trigger: 'blur' }],
        databaseName: [{ required: true, message: ' ', trigger: 'blur' }],
        port: [{ required: true, message: ' ', trigger: 'blur' }],
        username: [{ required: true, message: ' ', trigger: 'blur' }],
        password: [{ required: true, message: ' ', trigger: 'blur' }]
      },
      databaseTypeList: [
        { label: 'MySQL', value: '1' },
        { label: 'Mariadb', value: '4' },
        { label: 'SQLServer', value: '2' },
        { label: 'Oracle', value: '3' }
      ],
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
    saveDatabaseInfo (name) {
      const f = JSON.parse(JSON.stringify(this.dataBaseInfo))
      f.isConnected = false
      this.$refs[name].validate((valid) => {
        if (valid) {
          const list = store.get('databaseList') || []
          if (!f.id) {
            f.id = this.getUUID()
            list.push(f)
          } else {
            const i = list.findIndex(item => item.id === f.id)
            if (i === -1) {
              list.push(f)
            } else {
              list.splice(i, 1, f)
            }
          }
          store.set('databaseList', list)
          this.addDataBaseDialogVisible = false
          this.getTreeList()
        } else {
          this.$message.error('请将信息填写完整')
        }
      })
    },

    // 新增一个编辑器
    async query () {
      if (!this.selectDatabaseId) {
        return this.$message.error('未选择数据库')
      }
      const item = this.proOptions.find(e => e.id === this.selectDatabaseId)
      const res = await son.send('getTableAndColumns', item)
      // console.log(res.result)
      if (res && res.result.code === 20000) {
        const uid = this.getUUID()
        this.editorTabs.push({
          title: 'search',
          name: uid,
          dataBaseInfo: item,
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
    },
    openTable () {
      const data = this.proOptions.find(item => item.id === this.selectDatabaseId)
      const uid = this.getUUID()
      this.editorTabs.push({
        title: this.selectTables[0].connectName,
        name: uid,
        dataBaseInfo: data,
        close: true,
        tagType: -2
      })
      this.currentTabsName = uid
    },
    designTable () {
      const uid = this.getUUID()
      this.editorTabs.push({
        title: 'edite',
        name: uid,
        close: true,
        tagType: -3
      })
      this.currentTabsName = uid
    },
    addTable () {
      this.$message.warning('未开发')
    },
    async editDataBase (id) {
      this.dataBaseInfo = this.proOptions.find(e => e.id === id)
      if (this.dataBaseInfo.isConnected) {
        const confirmResult = await this.$confirm('正在连接中是否关闭连接?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return
        }
        this.dataBaseInfo.isConnected = false
      }
      this.addDataBaseDialogVisible = true
    },
    async delDataBase (id) {
      const list = store.get('databaseList')
      const i = list.findIndex(item => item.id === id)
      if (i === -1) {
        return
      }
      const confirmResult = await this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return
      }
      list.splice(i, 1)
      store.set('databaseList', list)
      this.getTreeList()
      this.$message.success('已删除')
    },

    editTable () {
      this.$message.warning('未开发')
    },
    delTable () {
      this.$message.warning('未开发')
    },
    tableEvent (data) {
      this.treeClickCount++
      if (this.treeClickCount >= 2) {
        // 超过2次点击的事件
        return
      }
      // 计时器,计算300毫秒为单位,可自行修改
      this.timer = window.setTimeout(() => {
        // 把次数归零
        if (this.treeClickCount === 1) {
          this.treeClickCount = 0
          // 单击事件处理
        } else if (this.treeClickCount > 1) {
          this.treeClickCount = 0
          // 双击事件处理
          this.openTable()
        }
      }, 300)
    },
    // 筛选节点
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    async loadNode (node, resolve) {
      if (node.level === 1) {
        const res = await son.send('getTables', node.data)
        if (res.result.code !== 20000) {
          this.$message.error(res.result.message)
          return resolve([])
        }
        const self = this
        const s = res.result.data.map(i => {
          return { connectName: i.name, id: self.getUUID(), type: 'table' }
        })
        this.tableList = s
        node.data.isConnected = true
        return resolve(s)
      }
      if (node.level > 1) {
        return resolve([])
      }
    },
    rightClick (event, data, e, element) {
      this.$refs.tree.setCurrentKey(data.id)
      let menu
      const that = this
      if (data.type === 'table') {
        menu = new Menu()
        menu.append(new MenuItem(
          {
            label: '编辑表结构',
            click: function () {
              that.editTable()
            }
          }
        ))
        menu.append(new MenuItem(
          {
            label: '删除表',
            click: function () {
              that.delTable()
            }
          }
        ))
        this.selectDatabaseId = e.parent.data.id
      } else {
        menu = new Menu()
        menu.append(new MenuItem(
          {
            label: '编辑连接',
            click: function () {
              that.editDataBase(data.id)
            }
          }
        ))
        menu.append(new MenuItem(
          {
            label: '删除连接',
            click: function () {
              that.delDataBase(data.id)
            }
          }
        ))
        this.selectDatabaseId = data.id
      }
      menu.popup(remote.getCurrentWindow())
    },
    openDataBaseDialog () {
      this.dataBaseInfo = {
        connectName: '',
        databaseType: '1',
        databaseAddress: 'localhost',
        databaseName: '',
        port: '3306',
        username: 'root',
        password: '',
        databaseDescription: ''
      }
      this.addDataBaseDialogVisible = true
    },
    refreshNode (id) {
      const node = this.$refs.tree.getNode(id)
      //  设置未进行懒加载状态
      node.loaded = false
      // 重新展开节点就会间接重新触发load达到刷新效果
      node.expand()
    },
    async connectTest (name) {
      this.testConnectShow = true
      const res = await son.send('connectTest', this.dataBaseInfo)
      console.log('connectTest', res.result)
      if (res.result.code === 20000) {
        this.$message.success('连接成功')
      } else {
        this.$message.error(res.result.message)
      }
      this.testConnectShow = false
    },
    handleNodeClick (data, e) {
      this.selectDatabaseId = data.type === 'table' ? e.parent.data.id : data.id
      this.treeClickCount++
      if (this.treeClickCount >= 2) {
        // 超过2次点击的事件
        return
      }
      // 计时器,计算300毫秒为单位,可自行修改
      this.timer = window.setTimeout(() => {
        // 把次数归零
        if (this.treeClickCount === 1) {
          this.treeClickCount = 0
          // 单击事件处理
        } else if (this.treeClickCount > 1) {
          this.treeClickCount = 0
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
  user-select: none;
  overflow-y: auto;
  overflow-x: auto;
  height: calc(100vh - 40px);
}

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

.result-box {
margin-top: 10px;
  width: 100%;
  height: 100%;
  transition: all 0.3s;

  .vue-drag-select {
    background-color: #ddd;
  }

  .item-self {
    border: 1px solid #fff;
    background-color: #fff;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      box-shadow: 0px 2px 20px -2px rgba(0, 0, 0, 0.5);
    }
  }

  .selected-item {
    .item-self {
      border: 1px solid red;
      border-color: rgb(1, 4, 16);
      box-shadow: rgb(1, 5, 21) 0px 0px 0px 2px !important;
    }
  }
}
</style>
