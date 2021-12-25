<template>
  <div ref="designRef" style="height: 100vh;">
    <el-row style="margin-left: 5px">
      <el-button type="primary" size="small">保存</el-button>
      <el-button type="primary" size="small" @click="insertField" v-show="tabValue==='Fields'">新增字段</el-button>
      <el-button type="primary" size="small" v-show="tabValue==='Fields'">删除字段</el-button>
      <el-button type="primary" size="small" @click="insertIndex" v-show="tabValue==='Indexes'">新增索引</el-button>
      <el-button type="primary" size="small" v-show="tabValue==='Indexes'">删除索引</el-button>
    </el-row>
    <el-tabs type="border-card" v-model="tabValue" style="margin-top:10px" :before-leave="beforeLeave">
      <el-tab-pane
          key="Fields"
          label="Fields"
          name="Fields"
      >
        <el-table
            :max-height="maxSize"
            :data="tableData"
            border
            key="Fields"
            resizable
            highlight-current-row
            @row-click="rowClick"
            size="small"
        >
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="radioId" :label="scope.row.id" size="mini"></el-radio>
            </template>
          </el-table-column>
          <el-table-column label="Name" align="center" prop="name">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="mini" type="text"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Type" align="center" prop="type">
            <template slot-scope="scope">
              <el-select v-model="scope.row.type" size="mini" filterable>
                <el-option
                    v-for="item in typeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Length" align="center" prop="length">
            <template slot-scope="scope">
              <el-input v-model="scope.row.length" type="number" size="mini"
                        oninput="value=value.replace(/[^\d]/g,'')"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Decimal" align="center" prop="decimal">
            <template slot-scope="scope">
              <el-input v-model="scope.row.decimal" type="number" size="mini"
                        oninput="value=value.replace(/[^\d]/g,'')"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Not null" align="center" prop="notNull">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.notNull"   size="mini"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Virtual" align="center" prop="virtual">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.virtual" size="mini"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Key" align="center" prop="key">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.key" size="mini" ></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Comment" align="center" prop="comment">
            <template slot-scope="scope">
              <el-input v-model="scope.row.comment" type="text" size="mini"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane
          key="Indexes"
          label="Indexes"
          name="Indexes"
      >
        <el-table
            :max-height="maxSize"
            :data="indexesTableData"
            border
            highlight-current-row
            @row-click="indexRowClick"
            size="small"
        >
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="indexesRadioId" :label="scope.row.id" size="mini"></el-radio>
            </template>
          </el-table-column>
          <el-table-column label="Name" align="center" prop="name">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="mini" type="text"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Fields" align="center" prop="fields">
            <template slot-scope="scope">
              <el-select multiple v-model="scope.row.fields" size="mini" filterable>
                <el-option
                    v-for="item in tableData"
                    :key="item.id"
                    :label="'`'+item.name+'`'"
                    :value="'`'+item.name+'`'"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Index Type" align="center" prop="indexType">
            <template slot-scope="scope">
              <el-select v-model="scope.row.indexType" size="mini" clearable>
                <el-option
                    v-for="item in indexTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Index method" align="center" prop="indexMethod">
            <template slot-scope="scope">
              <el-select v-model="scope.row.indexMethod" size="mini" clearable>
                <el-option
                    v-for="item in indexMethodList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Comment" align="center" prop="comment">
            <template slot-scope="scope">
              <el-input v-model="scope.row.comment" type="text" size="mini"></el-input>
            </template>
          </el-table-column>

        </el-table>
      </el-tab-pane>

      <el-tab-pane
          key="SQL Preview"
          label="SQL Preview"
          name="SQL Preview"
      >
        <pre>
        <code>{{ sqlPre }}</code>
          </pre>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { remote } from 'electron'
import mix from '../../mixin/mixin'
import Constant from '../../../utils/constant'
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
      indexesRadioId: null,
      loading: false,
      tableData: [],
      sqlPre: null,
      maxSize: 0,
      tabValue: 'Fields',
      indexesTableData: [],
      validRules: {
        name: [
          {
            required: true,
            message: '名称必须填写'
          }
        ]
      },
      typeList: [],
      indexTypeList: [
        {
          label: 'FULLTEXT',
          value: 'FULLTEXT'
        },
        {
          label: 'NORMAL',
          value: 'NORMAL'
        },
        {
          label: 'SPATIAL',
          value: 'SPATIAL'
        },
        {
          label: 'UNIQUE',
          value: 'UNIQUE'
        }
      ],
      indexMethodList: [
        {
          label: 'BTREE',
          value: 'BTREE'
        },
        {
          label: 'HASH',
          value: 'HASH'
        },
        {
          label: 'RTREE',
          value: 'RTREE'
        }
      ]
    }
  },
  mounted () {
    console.log(this.databaseInfo.databaseType)
    switch (this.databaseInfo.databaseType) {
      case '1':
      case '4':
        this.typeList = Constant.MYSQL_TYPE_LIST
        break
      case '2':
        this.typeList = []
        break
      case '3':
        this.typeList = []
        break
    }
    this.$nextTick().then(() => {
      this.maxSize = this.$refs.designRef.offsetHeight - 140
    })
    this.insertField()
    this.insertIndex()
  },

  methods: {
    rowClick (row) {
      this.radioId = row.id
    },
    beforeLeave (activeName) {
      if (activeName === 'SQL Preview') {
        this.getSqlPre(this.tableName)
      }
    },
    indexRowClick (row) {
      this.indexesRadioId = row.id
    },

    insertField () {
      const uid = this.getUUID()
      this.tableData.push({
        id: uid,
        type: 'varchar',
        length: 255
      })
      this.radioId = uid
    },
    insertIndex () {
      const uid = this.getUUID()
      this.indexesTableData.push({ id: uid })
      this.indexesRadioId = uid
    },
    keyChange (scope) {
      if (scope.row.key) {
        scope.row.notNull = true
      }
    },
    /**
     * DROP TABLE IF EXISTS {{=it.entity.defKey}};
     * CREATE TABLE {{=it.entity.defKey}}(
     * {{ pkList = [] ; }}
     * {{~it.entity.fields:field:index}}
     *     {{? field.primaryKey }}{{ pkList.push(field.defKey) }}{{?}}
     *     `{{=field.defKey}}` {{=field.type}}{{?field.len>0}}{{='('}}{{=field.len}}{{?field.scale>0}}{{=','}}{{=field.scale}}{{?}}{{=')'}}{{?}} {{= field.notNull ? 'NOT NULL' : '' }} {{= field.autoIncrement ? 'AUTO_INCREMENT' : '' }} {{= field.defaultValue ? it.func.join('DEFAULT',field.defaultValue,' ') : '' }} COMMENT '{{=it.func.join(field.defName,field.comment,';')}}' {{= index < it.entity.fields.length-1 ? ',' : ( pkList.length>0 ? ',' :'' ) }}
     * {{~}}
     * {{? pkList.length >0 }}
     *     PRIMARY KEY ({{~pkList:pkName:i}}`{{= pkName }}`{{= i<pkList.length-1 ? ',' : '' }}{{~}})
     * {{?}}
     * )  COMMENT = '{{=it.func.join(it.entity.defName,it.entity.comment,';') }}';
     * $blankline
     * @param tableName
     */
    getSqlPre (tableName) {
      tableName = tableName || 'Untitled'
      let col = ''
      const pkList = []
      for (let i = 0; i < this.tableData.length; i++) {
        const n = '`' + this.tableData[i].name + '`'
        if (this.tableData[i].key && this.tableData[i].name) {
          pkList.push(n)
        }
        const name = this.tableData[i].name ? n : ''
        const decimal = this.tableData[i].decimal > 0 ? ',' + this.tableData[i].decimal : ''
        const length = this.tableData[i].length > 0 ? '(' + this.tableData[i].length + decimal + ')' : ''
        const notNull = this.tableData[i].notNull ? 'NOT NULL' : 'NULL'
        col += name + ' ' + this.tableData[i].type + length + ' ' + notNull + (i < this.tableData.length - 1 ? ',' : '') + '\n'
      }
      if (pkList.length > 0) {
        col += 'PRIMARY KEY ' + '(' + pkList.toString() + ')'
      }
      this.sqlPre = 'CREATE TABLE `' + this.databaseInfo.databaseName + '`.`' + tableName + '`  (' + '\n' + col + ');'
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
