<template>
  <div>
    打开了表
  </div>
</template>

<script>
import { remote } from 'electron'
const son = remote.getGlobal('son')
export default {
  name: 'tableList',
  props: {
    databaseInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    tableName: {
      type: String,
      default: null
    }
  },

  data () {
    return {

    }
  },

  async  created () {
    const database = JSON.stringify(this.databaseInfo)
    console.log(database)
    const res = await son.send('getTablePage', { databaseInfo: database, tableName: this.tableName, num: 0, size: 1000 })
    console.log(res.result)
  },

  methods: {}
}
</script>

<style scoped>

</style>
