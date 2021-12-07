import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import './components/dialog/dragDialog'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import './icons' // icon

Vue.use(Element)
Vue.use(ViewUI)
Vue.use(VueCodemirror)

// Vue.prototype.$webContents = { value: '11' }
// Vue.config.productionTip = false
// Vue.config.silent = true //关闭错误信息
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// window.eventBus = new Vue()

// vue 可以new,框架自带的写法
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
