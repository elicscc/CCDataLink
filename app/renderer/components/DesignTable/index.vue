<template>
  <div ref="designRef" style="height: 100vh;">
    <el-row style="margin-left: 5px">
      <el-button type="primary" size="small">保存</el-button>
      <el-button type="primary" size="small" @click="insertField" v-show="tabValue==='Fields'">新增字段</el-button>
      <el-button type="primary" size="small" v-show="tabValue==='Fields'">删除字段</el-button>
      <el-button type="primary" size="small" @click="insertIndex" v-show="tabValue==='Indexes'">新增索引</el-button>
      <el-button type="primary" size="small" v-show="tabValue==='Indexes'">删除索引</el-button>
    </el-row>
    <el-tabs type="border-card" v-model="tabValue" style="margin-top:10px">
      <el-tab-pane
          key="Fields"
          label="Fields"
          name="Fields"
      >
        <el-table
            :max-height="maxSize"
            :data="tableData"
            border
            highlight-current-row
            @row-click="rowClick"
            size="small"
        >
          <el-table-column width="35">
            <template slot-scope="scope">
              <el-radio v-model="radioId" :label="scope.row.id" size="mini"></el-radio>
            </template>
          </el-table-column>
          <el-table-column label="Name" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="mini" type="text"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Type" align="center">
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
          <el-table-column label="Length" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.length" type="number" size="mini"
                        oninput="value=value.replace(/[^\d]/g,'')"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Decimal" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.decimal" type="number" size="mini"
                        oninput="value=value.replace(/[^\d]/g,'')"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Not null" align="center">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.notNull" size="mini"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Virtual" align="center">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.virtual" size="mini"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Key" align="center">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.key" size="mini"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Comment" align="center">
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
          <el-table-column label="Name" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="mini" type="text"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Fields" align="center">
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
          <el-table-column label="Index Type" align="center">
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
          <el-table-column label="Index method" align="center">
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
          <el-table-column label="Comment" align="center">
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
      </el-tab-pane>
    </el-tabs>
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
      indexesRadioId: null,
      loading: false,
      tableData: [],
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
      typeList: [
        {
          label: 'bigint',
          value: 'bigint'
        },
        {
          label: 'binary',
          value: 'binary'
        },
        {
          label: 'bit',
          value: 'bit'
        },
        {
          label: 'blob',
          value: 'blob'
        },
        {
          label: 'bool',
          value: 'bool'
        },
        {
          label: 'boolean',
          value: 'boolean'
        },
        {
          label: 'char',
          value: 'char'
        },
        {
          label: 'date',
          value: 'date'
        },
        {
          label: 'datetime',
          value: 'datetime'
        },
        {
          label: 'decimal',
          value: 'decimal'
        },
        {
          label: 'double',
          value: 'double'
        },
        {
          label: 'enum',
          value: 'enum'
        },
        {
          label: 'float',
          value: 'float'
        },
        {
          label: 'geometry',
          value: 'geometry'
        },
        {
          label: 'geometrycollection',
          value: 'geometrycollection'
        },
        {
          label: 'int',
          value: 'int'
        },
        {
          label: 'integer',
          value: 'integer'
        },
        {
          label: 'json',
          value: 'json'
        },
        {
          label: 'linestring',
          value: 'linestring'
        },

        {
          label: 'longblob',
          value: 'longblob'
        },
        {
          label: 'longtext',
          value: 'longtext'
        },

        {
          label: 'mediumblob',
          value: 'mediumblob'
        },
        {
          label: 'mediumint',
          value: 'mediumint'
        },

        {
          label: 'mediumtext',
          value: 'mediumtext'
        },
        {
          label: 'multilinestring',
          value: 'multilinestring'
        },

        {
          label: 'multipoint',
          value: 'multipoint'
        },

        {
          label: 'multipolygon',
          value: 'multipolygon'
        },
        {
          label: 'numeric',
          value: 'numeric'
        },
        {
          label: 'point',
          value: 'point'
        },
        {
          label: 'polygon',
          value: 'polygon'
        },
        {
          label: 'real',
          value: 'real'
        },

        {
          label: 'set',
          value: 'set'
        },

        {
          label: 'smallint',
          value: 'smallint'
        },

        {
          label: 'text',
          value: 'text'
        },

        {
          label: 'time',
          value: 'time'
        },
        {
          label: 'timestamp',
          value: 'timestamp'
        },

        {
          label: 'tinyblob',
          value: 'tinyblob'
        },
        {
          label: 'tinyint',
          value: 'tinyint'
        },
        {
          label: 'tinytext',
          value: 'tinytext'
        },

        {
          label: 'varbinary',
          value: 'varbinary'
        },

        {
          label: 'varchar',
          value: 'varchar'
        },
        {
          label: 'year',
          value: 'year'
        }

      ],
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

    indexRowClick (row) {
      this.indexesRadioId = row.id
    },

    insertField () {
      const uid = this.getUUID()
      this.tableData.push({ id: uid })
      this.radioId = uid
    },
    insertIndex () {
      const uid = this.getUUID()
      this.indexesTableData.push({ id: uid })
      this.indexesRadioId = uid
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
