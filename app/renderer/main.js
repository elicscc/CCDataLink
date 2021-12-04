import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'

import { server } from '../utils/axios'

import electron from 'electron'

import parseUrl from './router/parseUrl'

// 遍历下拉框的下拉选项，找到绑定的key对应的options，如果有正常返回，没有则返回undefined
Element.Select.mounted = function () {
  var e = this
  var t = this.$refs.reference
  if (t && t.$el) {
    var i = t.$el.querySelector('input')
    this.initialInputHeight = i.getBoundingClientRect().height ||
    { medium: 36, small: 32, mini: 28 }[this.selectSize]
  }
  this.resetInputHeight()
  this.$nextTick(function () {
    t && t.$el && (e.inputWidth = t.$el.getBoundingClientRect().width)
  })
  const list = []
  this.options.forEach(element => {
    list.push(element.value)
  })
  const value = list.find(item => {
    return item === this.value
  })
  if (!value) {
    console.log(value)
    this.$emit('change', '')
  } else {
    this.setSelected()
  }
}

Vue.use(Element)

Vue.use(ViewUI)

Vue.prototype.electron = electron

Vue.prototype.$axios = server

// Vue.prototype.$webContents = { value: '11' }
Vue.config.productionTip = false
// Vue.config.silent = true //关闭错误信息
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

window.eventBus = new Vue()

// vue 可以new,框架自带的写法
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
const paramObj = parseUrl(document.location.href)
if (paramObj.path) {
  router.push('/' + paramObj.path)
}
