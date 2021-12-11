<template>
  <div ref="console" class="console" />
</template>

<script>
import * as monaco from 'monaco-editor'
export default {
  name: 'MonacoConsole',
  props: {
    codes: {
      type: String,
      default: null
    },
    size: {
      type: Number,
      default: null
    }
  },
  data () {
    return {}
  },
  computed: {
    sidebarOpened () {
      return this.$store.state.app.sidebar.opened
    }
  },
  watch: {
    codes (runResult) {
      this.editor.setValue(runResult)
    },
    sidebarOpened: function (open) {
      const self = this
      setTimeout(function () {
        console.log('side bar changed' + open)
        self.editor.layout()
      }, 300)
    },
    size: function () {
      const self = this
      setTimeout(function () {
        console.log('size changed')
        self.editor.layout()
      }, 300)
    }
  },
  mounted () {
    this.initEditor()
  },
  methods: {
    initEditor () {
      const self = this

      self.editor = monaco.editor.create(self.$refs.console, {
        value: self.codes,
        language: 'plaintext',
        theme: self.theme, // vs, hc-black, or vs-dark
        readOnly: true, // 只读
        cursorStyle: 'line', // 光标样式
        automaticLayout: false, // 自动布局
        glyphMargin: false, // 字形边缘
        useTabStops: false,
        fontSize: 20, // 字体大小
        autoIndent: true // 自动布局
      })

      // 编辑器随窗口自适应
      window.addEventListener('resize', function () {
        self.editor.layout()
      })
    }

  }
}
</script>

<style scoped>
.console {
  height: 100%;
  width: 100%;
}
</style>
