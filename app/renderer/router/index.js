import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/s',
      name: 'title',
      component: () => import('@/views/title/title.vue')
    },
    {
      path: '/',
      name: 'edit',
      component: () => import('@/views/programmingEditor/programmingEditor.vue')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
