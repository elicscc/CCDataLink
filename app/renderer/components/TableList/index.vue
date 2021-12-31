<template>
  <div ref="refs" style="height: 100vh;">
    <vxe-table
        :data="dataList"
        border
        :max-height="maxSize"
        show-overflow
        highlight-hover-row
        :edit-config="{trigger: 'click', mode: 'cell'}">
      <vxe-column
          v-for="config in columns"
          :key="config.key"
          :field="config.title"
          :title="config.title"
          :width="config.width"
          :params="config.colt"
          :edit-render="{}"
      >
        <template #edit="{ row, column }">
          <vxe-input v-if="column.params.colType === 'datetime' " v-model="row[column.property]" type="datetime" transfer></vxe-input>
          <vxe-input v-else-if="column.params.colType === 'date' " v-model="row[column.property]" type="date" transfer></vxe-input>
          <vxe-input v-else v-model="row[column.property]" type="text"></vxe-input>
        </template>
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
      </el-col>
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
      loading: true,
      maxSize: 0,
      pageSize: 1000,
      page: 1,
      columns: [],
      dataList: []
    }
  },

  async mounted () {
    // 编辑器随窗口自适应
    // const self = this
    // window.addEventListener('resize', function () {
    //   self.maxSize = self.$refs.refs.offsetHeight - 100
    // })
    await this.getList()
    this.loading = false
  },

  methods: {
    test (column) {
      console.log(column)
    },
    async getList () {
      const database = JSON.stringify(this.databaseInfo)
      const res = await son.send('getTablePage', {
        databaseInfo: database,
        tableName: this.tableName,
        num: ((this.page - 1) * this.pageSize),
        size: this.pageSize
      })
      // console.log(res.result.data)
      const c = res.result.data.columnInfo
      this.columns = c.map(i => {
        let t, k, p
        if (res.result.data.databaseType === '2') {
          t = i.name
          k = i.name
          p = i.type
        } else {
          t = i.COLUMN_NAME
          k = i.COLUMN_NAME
          p = i.COLUMN_TYPE
        }
        return {
          title: t,
          key: k,
          colt: { colType: p },
          width: 300
        }
      })
      this.maxSize = this.$refs.refs.offsetHeight - 100
      this.dataList = res.result.data.dataList
    },
    async startPage () {
      if (this.page !== 1) {
        this.page = 1
        await this.changePage()
      }
    },
    async prevClick () {
      if (this.page > 1) {
        this.page--
        await this.changePage()
      }
    },
    async nextClick () {
      this.page++
      await this.changePage()
    },
    async endPage () {
      const database = JSON.stringify(this.databaseInfo)
      const res = await son.send('getTableCount', {
        databaseInfo: database,
        tableName: this.tableName
      })
      if (res.result.data) {
        const page = this.pageCount(res.result.data, this.pageSize)
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
