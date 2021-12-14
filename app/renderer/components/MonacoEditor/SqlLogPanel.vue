<template>
  <div>
    <el-tabs type="card">
      <el-tab-pane
        v-for="(sqlResult, index) in sqlResultList.resultSet"
        :key="index"
        style="display: block;"
        :label="'结果' + (index+1)"
        :name="'结果' + index"
      >
        <div onselectstart="return false">
          <el-table
            :data="sqlResult.dataList"
            border
            style="width: 100%"
            :max-height="size"
          >
            <el-table-column
              type="index"
              label="序号"
              :index="index+1"
              width="70"
            />
            <el-table-column
              v-for="(item, columnIndex) in sqlResult.columns"
              :key="item.key"
              :label="item.title"
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
      type: Object,
      default () {
        return {}
      }
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
