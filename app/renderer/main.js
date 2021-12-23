import Vue from 'vue'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import './components/dialog/dragDialog'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './icons'
import vueDragSelectPro from 'vue-drag-select-pro'
import 'vue-drag-select-pro/lib/vueDragSelectPro.css'
import App from './App'
import store from './store'
Vue.use(vueDragSelectPro)
Vue.use(Element)
Vue.use(VXETable)
/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: '<App/>'
}).$mount('#app')
