<template>
  <div>
    <Tabs type="card" :value="tab" :animated="false" v-if="sqlResultList.id">
      <TabPane
          v-show="sqlResultList.sql!=null"
          key="-1"
          label="message"
          name="-1"
      >
        <div v-if="sqlResultList.errorMessage">
          sql: {{ sqlResultList.sql }}<br/>
          报错：{{ sqlResultList.errorMessage }}
        </div>
        <div v-else>
          sql: {{ sqlResultList.sql }}<br/>
          <span v-show="sqlResultList.count">影响行：{{ sqlResultList.count }}<br/></span>
          time：{{ sqlResultList.time }}<br/>
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
        ></Table>

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
    return {
      tab: null
    }
  },

  watch: {
    'sqlResultList.id' (v) {
      if (this.sqlResultList.resultSet && this.sqlResultList.resultSet.length > 0) {
        this.tab = '结果1'
      }
      if (this.sqlResultList.errorMessage) {
        this.tab = '-1'
      }
    }
  },

  methods: {}
}
</script>
