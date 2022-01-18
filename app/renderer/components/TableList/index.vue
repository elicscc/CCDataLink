<template>
  <div ref="refs" style="height: 100vh;">
    <vxe-button @click="getCurrentData">选中行信息</vxe-button>
    <vxe-table
        ref="xTable"
        :data="dataList"
        border
        :max-height="maxSize"
        show-overflow
        :loading="loading"
        keep-source
        @current-change="currentChangeEvent"
        :row-config="{isCurrent: true, isHover: true}"
        :radio-config="{trigger: 'row',highlight: true, isHover: true}"
        :edit-config="{trigger: 'click', mode: 'cell', showStatus: true}">
      <vxe-column type="radio" title=" " width="40"></vxe-column>
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
          <vxe-input v-if="column.params.colType === 'datetime' " v-model="row[column.property]" type="datetime"
                     transfer></vxe-input>
          <vxe-input v-else-if="column.params.colType === 'date' " v-model="row[column.property]" type="date"
                     transfer></vxe-input>
          <vxe-input v-else v-model="row[column.property]" type="text"></vxe-input>
        </template>
      </vxe-column>
    </vxe-table>
    <el-row type="flex" style="margin-top: 8px">
      <el-col :span="3">
        <vxe-button type="text" size="mini" icon="vxe-icon--plus" @click="add">添加</vxe-button>
      </el-col>
      <el-col :span="3">
        <vxe-button type="text" size="mini" icon="vxe-icon--minus" @click="del" :disabled="isSelected()">删除</vxe-button>
      </el-col>
      <el-col :span="3">
        <vxe-button type="text" size="mini" icon="vxe-icon--check" @click="commit" disabled>提交</vxe-button>
      </el-col>
      <el-col :span="3">
        <vxe-button type="text" size="mini" icon="vxe-icon--close" @click="cancel" disabled>取消</vxe-button>
      </el-col>
      <el-col :span="3">
        <vxe-button type="text" size="mini" icon="vxe-icon--refresh" @click="refresh">刷新</vxe-button>
      </el-col>
      <el-col :span="3" :offset="8">
        <vxe-button type="text" size="mini" icon="vxe-icon--d-arrow-left" @click="startPage"></vxe-button>
      </el-col>
      <el-col :span="3">
        <vxe-button type="text" size="mini" icon="vxe-icon--arrow-left" @click="prevClick"></vxe-button>
      </el-col>
      <el-col :span="3">
        <vxe-input
            style="width:50px"
            size="mini"
            type="integer"
            step="1"
            min="1"
            v-model="page"
            @change="changePage"
        />
      </el-col>
      <el-col :span="3">
        <vxe-button type="text" size="mini" icon="vxe-icon--arrow-right" @click="nextClick"></vxe-button>
      </el-col>
      <el-col :span="3">
        <vxe-button type="text" size="mini" icon="vxe-icon--d-arrow-right" @click="endPage"></vxe-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { remote } from 'electron'
import min from '../../mixin/mixin'

const son = remote.getGlobal('son')
export default {
  name: 'tableList',
  mixins: [min],
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
      dataList: [],
      key: []
    }
  },

  async mounted () {
    // 编辑器随窗口自适应
    // const self = this
    // window.addEventListener('resize', function () {
    //   self.maxSize = self.$refs.refs.offsetHeight - 100
    // })
    await this.getList()
    if (this.dataList && this.dataList.length > 0) {
      this.$refs.xTable.setRadioRow(this.dataList[0])
      this.currentChangeEvent({ row: this.dataList[0] })
    }
    this.loading = false
  },

  methods: {
    currentChangeEvent ({ row }) {
      console.log('行选中事件', row)
    },
    isSelected () {
      if (this.$refs.xTable) {
        return !this.$refs.xTable.getRadioRecord()
      } else {
        return false
      }
    },
    getCurrentData () {
      // todo 需要获取修改前的数据
      // console.log(this.$refs.xTable.getRadioRecord())
      return this.$refs.xTable.getRadioRecord()
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
      this.key = c.filter(i => i.COLUMN_KEY === 'PRI').map(o => o.COLUMN_NAME)
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
      if (this.page <= 0) {
        return
      }
      this.loading = true
      await this.getList()
      this.loading = false
    },
    pageCount (totalNum, limit) {
      return totalNum > 0 ? ((totalNum < limit) ? 1 : ((totalNum % limit) ? (parseInt(totalNum / limit) + 1) : (totalNum / limit))) : 0
    },
    /**
     * 有一个主键时 [2022-01-10 11:04:20.695][localhost_3306][173][MARIADB]
     * INSERT INTO `test_cc`.`dsfgg`(`affsdd`, `asdsd`) VALUES ('AS', 'DDD')
     * Time: 0.002s
     *
     * [2022-01-10 11:04:20.698][localhost_3306][173][MARIADB]
     * SELECT * FROM `test_cc`.`dsfgg` WHERE `asdsd` = 'DDD'
     * Time: 0.000s
     *
     *
     * 有多个主键时[2022-01-10 11:07:22.673][localhost_3306][173][MARIADB]
     * INSERT INTO `test_cc`.`yy`(`sdgfasg`, `FS`, `sdsdf`, `key`) VALUES ('sdd', 9, 8.8, '4')
     * Time: 0.002s
     *
     * [2022-01-10 11:07:22.676][localhost_3306][173][MARIADB]
     * SELECT * FROM `test_cc`.`yy` WHERE `FS` = 9 AND `sdsdf` = 8.8 AND `key` = '4'
     * Time: 0.000s
     *
     * 无主键 [2022-01-10 11:13:27.211][localhost_3306][173][MARIADB]
     * INSERT INTO `test_cc`.`nokey`(`asd`, `ffsa`, `da`, `datet`) VALUES ('sd', 'dsd', '2022-01-11', '2022-01-10 11:13:18')
     * Time: 0.001s
     *
     * [2022-01-10 11:13:27.213][localhost_3306][173][MARIADB]
     * SELECT * FROM `test_cc`.`nokey` WHERE `asd` = 'sd' AND `ffsa` = 'dsd' AND `da` = Cast('2022-01-11' AS Binary(10)) AND `datet` = Cast('2022-01-10 11:13:18' AS Binary(19)) LIMIT 1
     * Time: 0.002s
     */
    add () {
      if (this.databaseInfo.databaseType === '2' || this.databaseInfo.databaseType === '3') {
        return this.$message.warning('暂不支持该数据库')
      }
      this.$message.warning('未开发')
    },
    /**
     * 有一个主键时 DELETE FROM `test_cc`.`dsfgg` WHERE `asdsd` = 'sddc'
     *
     *
     * 有多个主键时 [2022-01-10 11:08:05.626][localhost_3306][173][MARIADB]
     * DELETE FROM `test_cc`.`yy` WHERE `FS` = 9 AND `sdsdf` = 9 AND `key` = '4'
     * Time: 0.001s
     *
     * 无主键 [2022-01-10 11:17:33.812][localhost_3306][173][MARIADB]
     * DELETE FROM `test_cc`.`nokey` WHERE `asd` = 'sd' AND `ffsa` = 'dsd' AND `da` = Cast('2022-01-11' AS Binary(10)) AND `datet` = Cast('2022-01-10 11:13:18' AS Binary(19)) LIMIT 1
     *
     * DELETE FROM `test_cc`.`nokey` WHERE `asd` = 'sdds' AND `ffsa` IS NULL AND `da` IS NULL AND `datet` IS NULL LIMIT 1
     * Time: 0.002s
     *
     */
    async del () {
      if (this.databaseInfo.databaseType === '2' || this.databaseInfo.databaseType === '3') {
        return this.$message.warning('暂不支持该数据库')
      }
      console.log(this.key)
      const confirmResult = await this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return
      }
      let where
      const wh = []
      const data = this.getCurrentData()
      if (this.key.length > 0) {
        for (let i = 0; i < this.key.length; i++) {
          wh.push(this.key[i] + " = '" + data[this.key[i]] + "'")
        }
        where = ' WHERE ' + wh.join(' AND ')
      } else {
        // console.log(this.columns)
        // console.log(data)
        for (let i = 0; i < this.columns.length; i++) {
          if (this.columns[i].colt.colType === 'datetime') {
            // `da` = Cast('2022-01-11' AS Binary(10))
            wh.push(data[this.columns[i].key] ? (this.columns[i].key + " = Cast('" + data[this.columns[i].key] + "' AS Binary(19))") : (this.columns[i].key + ' IS NULL'))
          } else if (this.columns[i].colt.colType === 'date') {
            wh.push(data[this.columns[i].key] ? (this.columns[i].key + " = Cast('" + data[this.columns[i].key] + "' AS Binary(10))") : (this.columns[i].key + ' IS NULL'))
          } else {
            wh.push(data[this.columns[i].key] ? (this.columns[i].key + " = '" + data[this.columns[i].key] + "'") : (this.columns[i].key + ' IS NULL'))
          }
        }
        where = ' WHERE ' + wh.join(' AND ') + ' LIMIT 1'
      }
      const sql = 'DELETE FROM `' + this.databaseInfo.databaseName + '`.`' + this.tableName + '`' + where
      console.log(sql)
      const database = JSON.stringify(this.databaseInfo)
      console.log(database)
      const res = await son.send('exeUpdateSql', {
        databaseInfo: database,
        sql: sql
      })
      //  console.log(res.result)
      if (res.result.data.errorMessage) {
        this.$message({
          type: 'error',
          message: res.result.data.errorMessage
        })
      } else if (res.result.data.count >= 0) {
        this.$refs.xTable.removeRadioRow()
        this.$message({
          type: 'success',
          message: '修改成功'
        })
      }
    },
    /**
     * 没key [2022-01-10 11:19:48.77][localhost_3306][173][MARIADB]
     * UPDATE `test_cc`.`nokey` SET `da` = '2022-01-05' WHERE `asd` = 'asd' AND `ffsa` = '888s' AND `da` = Cast('2022-01-05' AS Binary(10)) AND `datet` = Cast('2022-01-10 11:18:16' AS Binary(19)) LIMIT 1
     * Time: 0.000s
     *
     * [2022-01-10 11:19:48.771][localhost_3306][173][MARIADB]
     * SELECT * FROM `test_cc`.`nokey` WHERE `asd` = 'asd' AND `ffsa` = '888s' AND `da` = Cast('2022-01-05' AS Binary(10)) AND `datet` = Cast('2022-01-10 11:18:16' AS Binary(19)) LIMIT 1
     * Time: 0.000s
     *
     *
     *多个key [2022-01-10 11:21:25.18][localhost_3306][173][MARIADB]
     * UPDATE `test_cc`.`yy` SET `sdsdf` = 78 WHERE `FS` = 7 AND `sdsdf` = 8 AND `key` = '8'
     * Time: 0.001s
     *
     * [2022-01-10 11:21:25.182][localhost_3306][173][MARIADB]
     * SELECT * FROM `test_cc`.`yy` WHERE `FS` = 7 AND `sdsdf` = 78 AND `key` = '8'
     * Time: 0.000s
     *
     * 一个key[2022-01-10 11:22:23.038][localhost_3306][173][MARIADB]
     * UPDATE `test_cc`.`dsfgg` SET `asdsd` = 'DDDss' WHERE `asdsd` = 'DDD'
     * Time: 0.002s
     *
     * [2022-01-10 11:22:23.041][localhost_3306][173][MARIADB]
     * SELECT * FROM `test_cc`.`dsfgg` WHERE `asdsd` = 'DDDss'
     * Time: 0.000s
     */
    commit () {
      if (this.databaseInfo.databaseType === '2' || this.databaseInfo.databaseType === '3') {
        return this.$message.warning('暂不支持该数据库')
      }
      this.$message.warning('未开发')
    },
    cancel () {
      this.$message.warning('未开发')
    },
    refresh () {
      this.$message.warning('未开发')
    }
  }
}
</script>
