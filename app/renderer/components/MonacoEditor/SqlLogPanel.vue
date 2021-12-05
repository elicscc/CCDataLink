<template>
  <div>
    <el-tabs type="card">
      <el-tab-pane
        v-for="(sqlResult, index) in sqlResultList"
        :key="index"
        style="display: block;"
        :label="'结果' + (index+1)"
        :name="'结果' + index"
      >
        <div onselectstart="return false">
          <el-table
            :cell-style="rowClass"
            :header-cell-style="headClass"
            :data="sqlResult.result"
            border
            style="width: 100%"
            :max-height="size"
          >
            <el-table-column
              type="index"
              label="序号"
              :index="getIndex"
              width="70"
            />
            <el-table-column
              v-for="(item, columnIndex) in sqlResult.columnLabels"
              :key="item"
              :label="item"
            >
              <template slot-scope="scope">
                {{ scope.row[columnIndex] }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>

export default {
  name: 'SqlLogPanel',

  props: {
    sqlResultList: {
      type: Array,
      default: null
    },
    size: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {}
  },
  methods: {}
}
</script>
<style scoped>

</style>
