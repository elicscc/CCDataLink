import Vue from 'vue'
import Vuex from 'vuex'
import electron from 'electron'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  state: {
    flag: 'description',
    taskCmts: [], // 任务流程组件
    clickCmpts: [], // ctrl下点选的组件
    copyCmpts: [], // 复制的组件
    ctrlPress: false, // ctrl是否按下
    taskFlowRightClick: {}, // 右键信息,包含是否显示及xy坐标
    taskComponentName: 'taskCmtTop',
    taskCmtValue: {}, // 当前选中组件的信息
    taskId: '',
    taskType: '3', // 任务类型， 1 数据采集流程 2 数据服务接口 3 数据填报流程
    interfaceInfo: {}, // 网页提取填报接口相关的信息
    picTrue: true, // 是否选中验证码图片
    logsTrue: true, // 是否选中登录按钮
    keywordTrue: true, // 是否选中验证码错误关键字
    showFloatType: '', // 需要展示的浮窗类型
    verificationCode: '', // 输入的验证码
    showOption: false, // 显示配置项
    tabSelector: '', // 表单cssSelector
    selectIndex: '', // 边框索引，给点击边框加绿色选中
    historyCmpt: '', // 历史组件
    showTip: false, // 是否显示提示
    iframeInfo: {}, // 存储高亮元素的iframe信息
    taskTabType: 'editTask', // 当前任务tab的类型 editTask(任务编辑) taskSet(任务设置) taskLog(运行日志)
    properties: {},
    businessInfo: {},
    shortcutKey: '', // 用户快捷键 ('':表示没有操作 'cut':剪切 'paste':粘贴 'copy':复制)
    cuttingList: [], // 当前的正处于剪切状态的uuid列表
    runnTask: false, // 任务正在执行中
    singleRunnTask: false // 单个任务正在执行中
  },
  getters: {
    taskFlowAndProperties: (state) => {
      // console.log(state.properties)
      return {
        taskFlow: JSON.parse(JSON.stringify(state.taskCmts)),
        properties: JSON.parse(JSON.stringify(state.properties))
      }
    }
  },
  mutations: {
    // 任务列表拖拽开始，改变拖拽的组名
    taskCircleStart (state, flagName) {
      state.flag = flagName
    },
    // 任务列表拖拽结束，恢复组名
    taskCircleEnd (state, flagName) {
      state.flag = flagName
    },
    // 拖拽完毕更新任务流信息
    updateTaskCmpt (state, value) {
      state.taskCmts = JSON.parse(JSON.stringify(value))
    },
    // 更新右键状态
    updateRightClickInfo (state, value) {
      state.taskFlowRightClick = value
    },
    addCopyCmpt (state, value) {
      console.log('add cmpt is', value)
      state.copyCmpts = JSON.parse(JSON.stringify(value))
    },
    clearCopyCmpt (state) {
      state.copyCmpts.length = 0
      electron.ipcRenderer.send('setTaskCmts', state.copyCmpts, [])
    },
    addClickCmpt (state, value) {
      // 去重
      for (let i = 0; i < state.clickCmpts.length; i++) {
        if (state.clickCmpts[i].uuid === value.uuid) {
          state.clickCmpts.splice(i, 1)
        }
      }
      state.clickCmpts.push(JSON.parse(JSON.stringify(value)))
    },
    cleanClickCmpt (state) {
      state.clickCmpts.length = 0
    },
    updateCtrlPress (state, value) {
      state.ctrlPress = value
    },

    // 点击浮窗插入任务流
    pushTaskcmt (state, value) {
      const obj = JSON.parse(JSON.stringify(value))
      const taskObj = state.taskCmts[state.taskCmts.length - 2]
      if (taskObj.type === 'webReportInterface' || taskObj.type === 'webExtractionInterface') {
        taskObj.childrenCmpt.splice(taskObj.childrenCmpt.length, 0, obj)
      } else {
        state.taskCmts.splice(state.taskCmts.length - 1, 0, obj)
      }
    },
    // 获取任务流当前最后一个节点
    getLastTaskcmt (state) {
      state.historyCmpt = state.taskCmts[state.taskCmts.length - 1]
    },
    // 更新新最后一个节点
    updateLastTaskcmt (state, value) {
      state.taskCmts.splice(state.taskCmts.length - 1, 1)
      state.taskCmts.push(value)
    },
    // 根据点击的组件，更改组件名称展示对应的属性面板
    changeTaskComponentName (state, value) {
      state.taskCmtValue = value.type
      state.selectIndex = value.type.uuid
    },
    changeTaskComponentTable (state, value) {
      state.taskCmtValue.tableData = value
    },
    changeComponentType (state, value) {
      state.taskComponentName = value
    },
    // 任务类型
    changeTaskType (state, value) {
      state.taskType = value
    },
    // 任务Id
    changeTaskId (state, id) {
      state.taskId = id
    },
    // 改变验证码识别图片展示
    changePicTrue (state, value) {
      state.picTrue = value
    },
    // 改变验证码识别登录按钮展示
    changeLogsTrue (state, value) {
      state.logsTrue = value
    },
    // 改变验证码识别失败关键字
    changeKeywordTrue (state, value) {
      state.keywordTrue = value
    },
    // 改变浮窗的类型
    changeShowFloatType (state, value) {
      state.showFloatType = value
    },
    // 获取手动输入的验证码
    getVerificationCode (state, value) {
      state.verificationCode = value
    },
    // 展示配置项与恢复默认
    changeOption (state, value) {
      state.showOption = value
      // state.showFloatType = ''
    },
    setTabSelector (state, value) {
      state.tabSelector = value
    },
    // 浮窗下拉框展示
    changeSelectOption (state, value) {
      state.selectOption = value
    },
    changeIframeInfo (state, value) {
      state.iframeInfo = value
    },
    // 保存所有组件的属性
    saveProperties (state, data) {
      // console.log(data)
      const uuid = data.uuid
      const properties = JSON.parse(JSON.stringify(state.properties))
      delete properties[uuid]
      properties[uuid] = data.properties
      state.properties = properties
      // state.properties[uuid] = JSON.parse(JSON.stringify(data.properties))
    },
    // 更新所有组件的值(初次进入编辑任务调用)
    updateProperties (state, data) {
      state.properties = JSON.parse(JSON.stringify(data))
    },
    // 选择网址后保存到页面
    changeBusinessInfo (state, data) {
      state.businessInfo = JSON.parse(JSON.stringify(data))
    },
    changeInterfaceInfo (state, data) {
      state.interfaceInfo = data
    },
    // 设置任务类型 1.editTask(任务编辑) 2.taskSet(任务设置) 3.taskLog(运行日志)
    setTaskTabType (state, type) {
      switch (type) {
        case 1:
          state.taskTabType = 'editTask'
          break
        case 2:
          state.taskTabType = 'taskSet'
          break
        case 3:
          state.taskTabType = 'taskLog'
          break
      }
      console.log('状态改变了', state.taskTabType)
    },
    // 用户快捷键变化 (type ----- '':表示没有操作 'cut':剪切 'paste':粘贴 'copy':复制)
    changeShortCutKey (state, type) {
      state.shortcutKey = type
    },
    // 添加用户剪切的列表
    addCuttingList (state, uuid) {
      state.cuttingList.push(uuid)
    },
    // 清空用户剪切的列表
    clearCuttingList (state) {
      state.cuttingList = []
    },
    // 运行任务
    taskRunning (state) {
      state.runnTask = true
    },
    // 停止任务
    taskStop (state) {
      state.runnTask = false
    },
    // 运行单个任务
    taskSingleRunning (state) {
      state.runnTask = true
      state.singleRunnTask = true
    },
    taskSingleStop (state) {
      state.runnTask = false
      state.singleRunnTask = false
    }
  },
  actions: {}
})
