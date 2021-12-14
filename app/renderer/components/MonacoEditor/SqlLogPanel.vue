<template>
  <div>
    <Tabs type="card">
      <TabPane
          v-for="(sqlResult, index) in sqlResultList.resultSet"
          :key="index"
          :label="'结果' + (index+1)"
          :name="'结果' + index"
      >
        <Scroll>
          <Table
              :columns="sqlResult.columns"
              :data="sqlResult.dataList"
              size="small"
              border
              ellipsis
              tooltip
          ></Table>
        </Scroll>
      </TabPane>
    </Tabs>
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
