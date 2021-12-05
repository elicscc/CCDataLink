import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'title',
      component: () => import('@/views/title/title.vue')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
