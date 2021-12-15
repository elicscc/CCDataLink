import Vue from 'vue'
import App from './App'
import store from './store'
import './components/dialog/dragDialog'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
import './icons'
import vueDragSelectPro from 'vue-drag-select-pro'
import 'vue-drag-select-pro/lib/vueDragSelectPro.css'

Vue.use(vueDragSelectPro)
Vue.use(Element)
Vue.use(ViewUI)

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: '<App/>'
}).$mount('#app')
