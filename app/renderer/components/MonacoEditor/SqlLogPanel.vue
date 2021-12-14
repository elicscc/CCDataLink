<template>
  <div>
    <Tabs type="card" :value="tab" :animated="false">
      <TabPane
          v-show="sqlResultList.sql!=null"
          key="-1"
          label="message"
          name="-1"
      >
        <div v-if="sqlResultList.errorMessage">
         sql: {{sqlResultList.sql}}<br/>
          报错：{{sqlResultList.errorMessage}}
        </div>
        <div v-else>
          sql: {{sqlResultList.sql}}<br/>
          <span v-show="sqlResultList.count">影响行：{{sqlResultList.count}}<br/></span>
          time：{{sqlResultList.time}}<br/>
        </div>
      </TabPane>
      <TabPane
          v-for="(sqlResult, index) in (sqlResultList.resultSet)"
          :key="index"
          :label="'结果' + (index+1)"
          :name="'结果' + (index+1)"
      >

          <Table
              :max-height="size"
              :columns="sqlResult.columns"
              :data="sqlResult.dataList"
              size="small"
              border
              ellipsis
              tooltip
          ></Table>

      </TabPane>
    </Tabs>
  </div>
</template>
<script>

export default {
  name: 'SqlLogPanel',
  props: {
    sqlResult: {
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
    return {
      tab: null
    }
  },
  computed: {
    // 子组件和父组件进行双向绑定的方法
    sqlResultList: {
      get (v) {
        return this.sqlResult
      }
    }
  },

  watch: {
    sqlResult (v) {
      if (v.resultSet && v.resultSet.length > 0) {
        console.log('d', v)
        this.$nextTick(() => {
          this.tab = '结果1'
        })
      }
    }
  },

  methods: {}
}
</script>
<style scoped>

</style>
