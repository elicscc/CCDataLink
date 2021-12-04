<template>
  <div id="app">
    <!-- 自定义标题栏 需将main.js中的frame改为false -->
    <!-- <ElectronTitle /> -->
    <router-view></router-view>
  </div>
</template>

<script>
// import ElectronTitle from './views/title/title'
// import electron from 'electron'

export default {
  name: 'cc',
  // components: {
  //   ElectronTitle
  // }
  created () {
    // const javaLangSystem = java.import('java.lang.System')
    // javaLangSystem.out.printlnSync('Hello World')
  }

}
</script>

<style lang="scss">
@import url('./styles/fonts/iconfont.css');

* {
  // box-sizing: border-box;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: 微软雅黑;
}

html {
  height: 100%;
  border: 1px solid #666666;
  overflow: hidden;
  // width: calc(100% - 1px);
  width: 100%;
}

body {
  height: 100%;
}

#app {
  height: 100%;
}

html::-webkit-scrollbar {
  width: 2px;
  height: 5px;
}

html::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

html::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
}

.has_error {
  border-color: red !important;
}

.el-loading-mask {
  top: 43px !important;
}

.scrollView {
  margin: 0 10px;
  overflow: auto;
}

.scrollView::-webkit-scrollbar, .scroll::-webkit-scrollbar {
  width: 4px;
  height: 5px;
}

.scrollView::-webkit-scrollbar-thumb, .scroll::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

.scrollView::-webkit-scrollbar-track, .scroll::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
}

.el-input .el-input-group__append {
  background-color: #ffffff;
}

// .el-table--scrollable-x .el-table__body-wrapper::-webkit-scrollbar{
//   width: 2px;
//   height: 5px;
// }
// .el-table--scrollable-x .el-table__body-wrapper::-webkit-scrollbar-thumb{
//   border-radius: 10px;
//   -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
//   background: rgba(0,0,0,0.2);
//  }
// .el-table--scrollable-x .el-table__body-wrapper::-webkit-scrollbar-track {
//   -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
//   border-radius: 0;
//   background: rgba(0,0,0,0.1);
// }
/* CSS */
</style>
