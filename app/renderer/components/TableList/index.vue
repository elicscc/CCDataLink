<template>
  <div ref="refs" style="height: 100vh;">
    <Table
        :loading="loading"
        :max-height="size"
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
      loading: true,
      size: 0,
      columns: [],
      dataList: []
    }
  },

  async  created () {
    // 编辑器随窗口自适应
    const self = this
    window.addEventListener('resize', function () {
      self.size = self.$refs.refs.offsetHeight - 70
    })
    const database = JSON.stringify(this.databaseInfo)
    console.log(database)
    const res = await son.send('getTablePage', { databaseInfo: database, tableName: this.tableName, num: 0, size: 1000 })
    console.log(res.result)
    const c = res.result.data.columnInfo
    this.columns = c.map(i => {
      return {
        title: i.COLUMN_NAME,
        key: i.COLUMN_NAME,
        width: 300,
        resizable: true,
        ellipsis: true,
        tooltip: true
      }
    })
    this.size = this.$refs.refs.offsetHeight - 70
    this.dataList = res.result.data.dataList
    this.loading = false
  },

  methods: {}
}
</script>
