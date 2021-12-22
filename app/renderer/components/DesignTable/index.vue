<template>
 <div>设计</div>
</template>

<script>
import { remote } from 'electron'
const son = remote.getGlobal('son')
export default {
  name: 'designTable',
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
      maxSize: 0,
      size: 100,
      page: 1,
      columns: [],
      dataList: []
    }
  },

  methods: {
    async getList () {
      const database = JSON.stringify(this.databaseInfo)
      const res = await son.send('getTablePage', { databaseInfo: database, tableName: this.tableName, num: ((this.page - 1) * this.size), size: this.size })
      const c = res.result.data.columnInfo
      this.columns = c.map(i => {
        let t, k
        if (res.result.data.databaseType === '2') {
          t = i.name
          k = i.name
        } else {
          t = i.COLUMN_NAME
          k = i.COLUMN_NAME
        }
        return {
          title: t,
          key: k,
          width: 300,
          resizable: true,
          ellipsis: true,
          tooltip: true
        }
      })
      this.maxSize = this.$refs.refs.offsetHeight - 100
      this.dataList = res.result.data.dataList
    },
    async  startPage () {
      if (this.page !== 1) {
        this.page = 1
        await this.changePage()
      }
    },
    async  prevClick () {
      if (this.page > 1) {
        this.page--
        await this.changePage()
      }
    },
    async  nextClick () {
      this.page++
      await this.changePage()
    },
    async  endPage () {
      const database = JSON.stringify(this.databaseInfo)
      const res = await son.send('getTableCount', { databaseInfo: database, tableName: this.tableName })
      if (res.result.data) {
        const page = this.pageCount(res.result.data, this.size)
        if (this.page !== page) {
          this.page = page
          await this.changePage()
        }
      }
    },
    async changePage () {
      this.loading = true
      await this.getList()
      this.loading = false
    },
    pageCount (totalNum, limit) {
      return totalNum > 0 ? ((totalNum < limit) ? 1 : ((totalNum % limit) ? (parseInt(totalNum / limit) + 1) : (totalNum / limit))) : 0
    }

  }
}
</script>
