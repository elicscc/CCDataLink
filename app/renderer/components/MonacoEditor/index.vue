<template>
  <div
    @keydown.ctrl.shift="suggest"
    @keyup.110="keyHandler"
    @keyup.190="keyHandler"
  >
    <div style="padding-left:10px">
      <el-select v-model="languageCopy" size="small" style="width: 120px" placeholder="language" @change="reInitEditor">
        <el-option
          v-for="item in languageOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button type="success" :disabled="!runComplete" size="small" style="margin-left:10px" @click="run()">
        <svg-icon icon-class="run" />
        运行
      </el-button>
      <el-button type="success" size="small" @click="stop()">
        <svg-icon icon-class="stop" />
        停止
      </el-button>
      <el-button v-if="type===1" type="success" size="small" @click="save()">
        <svg-icon icon-class="skill" />
        保存
      </el-button>
      <el-button type="success" :disabled="!runComplete" size="small" @click="formatSql()">
        <svg-icon icon-class="format" />
        格式化
      </el-button>
      <span style="color:#ffffff">按ctrl + shift 键触发自动补全</span>
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
      style="height: calc(100vh - 245px);margin-top: 15px;margin-bottom: 5px;"
      @resize="reInitEditor"
    >
      <template slot="paneL">
        <div
          ref="container"
          v-loading="!runComplete"
          element-loading-text="执行中,请耐心等待..."
          style="height: 100%;"
        />
      </template>
      <template slot="paneR">
        <div ref="getheight" style="height: 100%;">
          <el-row>
            <label style="color:#ffffff;margin-left:5px">执行结果:
              <span v-if="runResult">执行成功</span>
            </label>
          </el-row>
          <monaco-console
            v-if="( languageCopy || language).toLowerCase() === 'python'"
            :codes="pythonResult"
            :size="pythonConsoleSize"
            style="height:98%;border-top: 1px solid #dfe4ed"
          />
          <sql-log-panel
            v-else
            style="height:98%;"
            :size="sqlSize"
            :sql-result-list="sqlResultList"
          />
        </div>
      </template>
    </split-pane>
  </div>
</template>
<script>
import * as monaco from 'monaco-editor'
import MonacoConsole from './MonacoConsole'
import SqlLogPanel from './SqlLogPanel'
import SplitPane from 'vue-splitpane'
import formatter from 'sql-formatter'

export default {
  name: 'MyMonacoEditor',
  components: { SplitPane, MonacoConsole, SqlLogPanel },
  props: {
    insertTableName: {
      type: String,
      default: () => null
    },
    type: {
      type: Number,
      default: 1
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
      sqlSize: 0,
      themeOption: [
        {
          value: 'vs',
          label: '默认主题'
        },
        {
          value: 'vs-dark',
          label: '黑色主题'
        }
      ],
      languageOption: [
        {
          value: 'sparkSql',
          label: 'SparkSql'
        },
        {
          value: 'sql',
          label: 'SQL'
        },
        {
          value: 'python',
          label: 'Python'
        }
      ],
      // 循环获取日志 定时任务 的引用
      interval: null,
      editor: null,
      languageCopy: 'sql',
      sqlResultList: [],
      pythonResult: null,
      pythonConsoleSize: -1,
      runResultLogType: null,
      asyncResult: {
        uniqueId: null,
        toolType: null,
        sqlNums: null
      },
      // 执行是否完成
      runComplete: true,
      // 执行是否成功
      runResult: false,
      codeCopy: ''// 内容备份
    }
  },
  computed: {
    sidebarOpened () {
      return this.$store.state.app.sidebar.opened
    },
    currentTabsName () {
      return this.$store.state.monaco.currentTabsName
    },
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
    },
    sidebarOpened: function (open) {
      const self = this
      setTimeout(function () {
        self.editor.layout()
      }, 300)
    },
    currentTabsName: function (name) {
      const self = this
      if (name === this.name) {
        self.editor.layout()
      }
    }
  },
  mounted () {
    this.languageCopy = this.language
    this.codeCopy = this.code
    this.initEditor()
  },
  methods: {
    initEditor: function () {
      const self = this
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
      const self = this
      this.runComplete = false
      this.sqlResultList = []
      this.pythonResult = null
      let transformCode = this.codeCopy || this.code
      const value = self.editor.getValue()
      const selection = self.editor.getSelection()
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
      // try {
      //   const response = await post('/transformInfo/execute', {
      //     id: this.id,
      //     toolType: this.languageCopy,
      //     transformCode
      //   })
      //   this.asyncResult = response.data
      // } catch (err) {
      //   // 如果不是20000,直接返回
      //   this.runComplete = true
      //   this.runResult = false
      //   return
      // }

      // 循环请求次数
      const time = 0
      // this.interval = setInterval(async () => {
      //   time = time + 1
      //   if (time > 60) {
      //     self.runComplete = true
      //     self.$message.error('任务执行超时,请重试')
      //     clearInterval(self.interval)
      //   }
      //   const { data } = await get('/transformInfo/fetchTransformLog', this.asyncResult)
      //     .catch(err => {
      //       console.log(err)
      //       this.runComplete = true
      //       this.runResult = false
      //       clearInterval(self.interval)
      //     })
      //   if (data && data.logStatus === true) {
      //     clearInterval(self.interval)
      //     self.sqlResultList = data.sqlResults
      //
      //     this.sqlSize = this.$refs.getheight.offsetHeight - 70
      //     self.pythonResult = data.pythonLog
      //     this.runComplete = true
      //     this.runResult = true
      //     self.showLog(data)
      //   }
      // }, 10 * 1000)
    },
    showLog (data) {
      console.log(data)
    },
    stop () {
      // get('/transformInfo/cancel?jobId=demoData', { jobId: this.asyncResult.uniqueId })
      //   .then(() => {
      //     this.runComplete = true
      //     clearInterval(this.interval)
      //     this.tipsSuccess()
      //   })
    },
    keyHandler () {
      // 快捷键触发monaco的自动提示补全功能
      console.log('trigger')
      this.editor.trigger('随便写点儿啥', 'editor.action.triggerSuggest', {})
    },
    suggest () {
      // 快捷键触发monaco的自动提示补全功能
      console.log('trigger')
      this.editor.trigger('随便写点儿啥', 'editor.action.triggerSuggest', {})
    },
    save () {
      const self = this
      const transformCode = this.codeCopy || this.code
      // post('/transformInfo/saveCode', { id: this.id, toolType: this.languageCopy, transformCode })
      //   .then(() => {
      //     self.tipsSuccess()
      //   })
    },
    formatSql () {
      this.codeCopy = formatter.format(this.codeCopy)
      this.editor.setValue(this.codeCopy)
    },
    setTheme (currentTheme) {
      monaco.editor.setTheme(currentTheme)
      this.$store.dispatch('monaco/setMonacoTheme', currentTheme)
    },
    reInitEditor () {
      this.editor.dispose()
      this.initEditor()
      // 用于python控制台resize
      this.pythonConsoleSize++
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
