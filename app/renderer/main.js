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
import './icons'

Vue.use(Element)
Vue.use(ViewUI)
Vue.use(VueCodemirror)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
