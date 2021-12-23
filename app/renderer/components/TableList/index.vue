<template>
  <div ref="refs" style="height: 100vh;">
    <vxe-table
        border
        :max-height="maxSize"
        show-overflow
        highlight-hover-row
        :data="dataList">
      <vxe-column
          v-for="config in columns"
          :key="config.key"
          :field="config.title"
          :title="config.title"
          :width="config.width"
      >
      </vxe-column>
    </vxe-table>
    <el-row type="flex" style="margin-top: 8px">
      <el-col :span="3" :offset="15">
      <el-button type="primary" size="mini" icon="el-icon-back" @click="startPage"></el-button>
      </el-col>
      <el-col :span="3">
      <el-button type="primary" size="mini" icon="el-icon-caret-left" @click="prevClick"></el-button>
      </el-col>
      <el-col :span="3">
      <el-input
          size="mini"
          type="number"
          v-model="page"
          @change="changePage"
      />
      </el-col>
      <el-col :span="3">
      <el-button type="primary" size="mini" icon="el-icon-caret-right" @click="nextClick"></el-button>
      </el-col >
      <el-col :span="3">
      <el-button type="primary" size="mini" icon="el-icon-right" @click="endPage"></el-button>
      </el-col>
    </el-row>
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
      tableData: [
        { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
        { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
        { id: 10003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
        { id: 10004, name: 'Test4', role: 'Designer', sex: 'Women', age: 23, address: 'test abc' },
        { id: 10005, name: 'Test5', role: 'Develop', sex: 'Women', age: 30, address: 'Shanghai' },
        { id: 10006, name: 'Test6', role: 'Designer', sex: 'Women', age: 21, address: 'test abc' },
        { id: 10007, name: 'Test7', role: 'Test', sex: 'Man', age: 29, address: 'test abc' },
        { id: 10008, name: 'Test8', role: 'Develop', sex: 'Man', age: 35, address: 'test abc' }
      ],
      loading: true,
      maxSize: 0,
      size: 100,
      page: 1,
      columns: [],
      dataList: []
    }
  },

  async created () {
    // 编辑器随窗口自适应
    const self = this
    window.addEventListener('resize', function () {
      self.maxSize = self.$refs.refs.offsetHeight - 100
    })
    await this.getList()
    this.loading = false
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
