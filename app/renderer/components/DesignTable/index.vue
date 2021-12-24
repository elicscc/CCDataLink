<template>
  <div>
    <vxe-toolbar ref="xToolbar" :loading="loading">
      <template #buttons>
        <vxe-button status="primary" content="保存" @click="saveEvent"></vxe-button>
        <span>
        <vxe-button status="primary" content="新增字段" @click="insertEvent"></vxe-button>
        <vxe-button status="warning" content="删除字段" @click="removeSelectEvent"></vxe-button>
        </span>
        <span>
        <vxe-button status="primary" content="新增索引" @click="insertEvent"></vxe-button>
        <vxe-button status="warning" content="删除索引" @click="removeSelectEvent"></vxe-button>
        </span>
      </template>
    </vxe-toolbar>
    <el-table
        :data="tableData"
        :border="true"
        highlight-current-row
        @row-click="rowClick"
        size="small"
    >
      <el-table-column  width="35">
        <template slot-scope="scope">
          <el-radio v-model="radioId" :label="scope.row.id"></el-radio>
        </template>
      </el-table-column>
      <el-table-column label="Name" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.name" type="text"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="Type" align="center">
        <template slot-scope="scope">
          <el-select v-model="scope.row.type" size="mini"  filterable>
              <el-option
                  v-for="item in typeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              ></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="Length" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.length" type="number" oninput ="value=value.replace(/[^\d]/g,'')"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="Decimal" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.decimal" type="number" oninput ="value=value.replace(/[^\d]/g,'')"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="Not null" align="center">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.notNull" ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="Virtual" align="center">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.virtual" ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="Key" align="center">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.key" ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="Comment" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.comment" type="text"></el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { remote } from 'electron'
import mix from '../../mixin/mixin'
const son = remote.getGlobal('son')

export default {
  name: 'designTable',
  mixins: [mix],
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
      radioId: null,
      loading: false,
      tableData: [],
      validRules: {
        name: [
          { required: true, message: '名称必须填写' }
        ]
      },
      typeList: [
        { label: 'bigint', value: 'bigint' },
        { label: 'binary', value: 'binary' },
        { label: 'bit', value: 'bit' }
      ]
    }
  },
  mounted () {
    // this.$nextTick(() => {
    //   // 将表格和工具栏进行关联
    //   const $table = this.$refs.xTable
    //   $table.connect(this.$refs.xToolbar)
    // })
    // this.loadList()
  },

  methods: {
    rowClick (row) {
      console.log(row)
      this.radioId = row.id
    },
    async loadList () {
      this.loading = true
      try {
        // const res = await fetch('https://api.xuliangzhan.com:10443/demo/api/pub/all').then(response => response.json())
        // this.tableData = res
      } catch (e) {
        this.tableData = []
      }
      this.loading = false
    },
    insertEvent () {
      const uid = this.getUUID()
      this.tableData.push({ id: uid })
      this.radioId = uid
    },
    async removeSelectEvent () {
      const $table = this.$refs.xTable
      await $table.removeCheckboxRow()
    },
    async deleteSelectEvent () {
      const type = await this.$confirm('您确定要删除选中的数据?')
      if (type !== 'confirm') {
        return
      }
      const $table = this.$refs.xTable
      const checkboxRecords = $table.getCheckboxRecords()
      this.loading = true
      try {
        const body = { removeRecords: checkboxRecords }
        // await XEAjax.post('https://api.xuliangzhan.com:10443/demo/api/pub/save', body)
        await this.loadList()
      } catch (e) {
      }
      this.loading = false
    },
    async removeRowEvent (row) {
      const $table = this.$refs.xTable
      await $table.remove(row)
    },
    async deleteRowEvent (row) {
      const type = await this.$confirm('您确定要删除该数据?')
      if (type !== 'confirm') {
        return
      }
      this.loading = true
      try {
        const body = { removeRecords: [row] }
        // await XEAjax.post('https://api.xuliangzhan.com:10443/demo/api/pub/save', body)
        await this.loadList()
      } catch (e) {
      }
    },
    async saveEvent () {
      const $table = this.$refs.xTable
      const { insertRecords, removeRecords, updateRecords } = $table.getRecordset()
      if (insertRecords.length <= 0 && removeRecords.length <= 0 && updateRecords.length <= 0) {
        this.$message.warning('数据未改动')
        return
      }
      const errMap = await $table.validate().catch(errMap => errMap)
      if (errMap) {
        return
      }
      this.loading = true
      try {
        const body = { insertRecords, removeRecords, updateRecords }
        // await XEAjax.post('https://api.xuliangzhan.com:10443/demo/api/pub/save', body)
        await this.loadList()
        this.$message.success('操作成功')
      } catch (e) {
        if (e && e.message) {
          this.$message.error(e.message)
        }
      }
      this.loading = false
    }

  }

}
</script>
<style lang="scss">
.custom-radio {
  font-size: 18px;
  cursor: pointer;
  user-select: none;
}
</style>
