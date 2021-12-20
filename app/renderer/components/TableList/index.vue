<template>
  <div style="height: calc(100vh - 80px)">
    <Table
        :columns="columns"
        :data="dataList"
        size="small"
        border
    ></Table>
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
      columns: [],
      dataList: []
    }
  },

  async  created () {
    const database = JSON.stringify(this.databaseInfo)
    console.log(database)
    const res = await son.send('getTablePage', { databaseInfo: database, tableName: this.tableName, num: 0, size: 1000 })
    console.log(res.result)
    const c = res.result.data.columnInfo
    this.columns = c.map(i => {
      return {
        title: i.COLUMN_NAME,
        key: i.COLUMN_NAME
      }
    })
    this.dataList = res.result.data.dataList
  },

  methods: {}
}
</script>

<style scoped>

</style>
