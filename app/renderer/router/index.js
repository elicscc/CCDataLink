/*
 * @Description:
 * @Author: 雷震子
 * @Date: 2020-07-28 08:54:23
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-02-23 10:30:12
 */
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
