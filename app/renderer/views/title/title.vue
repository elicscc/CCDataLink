<template>
  <div id="electronTitle" >
    <img src="static/logo/logo.ico" alt="" class="img">
    <span class="name">CC</span>
    <div class="btn">
<!--      <span class="icon min"><i class="iconfont" @click="clickIpcSend('min')">&#xe623;</i></span>-->
<!--      <span class="icon max" v-if="!isMax"><i class="iconfont" @click="clickIpcSend('max')">&#xe651;</i></span>-->
<!--      <span class="icon max" v-if="isMax"><i class="iconfont" @click="clickIpcSend('max')">&#xe605;</i></span>-->
<!--      <span class="icon close"><i class="iconfont" @click="clickIpcSend('close')">&#xe604;</i></span>-->

    </div>
    奥术大师大的
  </div>
</template>
<script>
import { ipcRenderer as ipc } from 'electron'

export default {
  name: 'electronTitle',
  data () {
    return {
      isMax: false
    }
  },
  methods: {
    clickIpcSend (type) {
      ipc.send(type)
      if (type === 'max') {
        this.isMax = !this.isMax
      }
    }
  }
}
</script>
<style>
  #electronTitle{
    width: 100%;
    height: 30px;
    background-color: #fff;
    -webkit-app-region:drag;
    position: relative;
  }
  .img{
    width: 20px;
    height: 20px;
    margin-left: 10px;
    margin-top: 5px;
    float: left;
  }
  .name{
    height: 30px;
    line-height: 30px;
    display: inline-block;
    margin-left:5px;
    color: black;
  }
  .btn{
    float: right;
    -webkit-app-region: no-drag;
  }
  .icon{
    width: 40px;
    text-align: center;
    display: inline-block;
    height: 30px;
    line-height: 30px;
    cursor: pointer
  }
  .min:hover{
    background: #E5E5E5;
  }
  .max:hover{
    background: #E5E5E5;
  }
  .close:hover{
    background: #E81123;
    color: #FFF;
  }
</style>
