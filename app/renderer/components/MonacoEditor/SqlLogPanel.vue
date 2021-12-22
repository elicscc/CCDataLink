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
          v-for="(sqlResult, index) in resultSet"
          :key="index"
          :label="'结果' + (index+1)"
          :name="'结果' + (index+1)"
      >
        <div>总条数： {{ sqlResult.count }}(仅展示前20条) 点此展示全部</div>
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
      tab: null,
      resultSet: []
    }
  },

  watch: {
    'sqlResultList.id' (v) {
      const resultSet = JSON.parse(JSON.stringify(this.sqlResultList.resultSet))
      this.convertResultSet(resultSet)
      if (this.sqlResultList.resultSet && this.sqlResultList.resultSet.length > 0) {
        this.tab = '结果1'
      }
      if (this.sqlResultList.errorMessage) {
        this.tab = '-1'
      }
    }
  },

  methods: {
    convertResultSet (resultSet) {
      for (let i = 0; i < resultSet.length; i++) {
        resultSet[i].count = resultSet[i].dataList.length
        resultSet[i].dataList = resultSet[i].dataList.slice(0, 20)
      }
      this.resultSet = resultSet
    //  console.log(this.resultSet)
    }
  }
}
</script>
