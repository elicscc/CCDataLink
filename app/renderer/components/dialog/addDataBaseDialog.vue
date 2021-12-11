<template>
  <!--编辑表头弹窗-->
  <el-dialog
      title="connect"
      :visible="showDialog"
      :show-close="true"
      width="700"
      :close-on-click-modal="false"
      :modal="false"
      v-dialogDrag
      class="dialog"
      @close="close"
  >
  <!-- 新增数据库弹窗 -->
  <div class="innerView">
    <Form
      class="form"
      ref="dataBaseInfo"
      :model="dataBaseInfo"
      :rules="dataBaseInfoRules"
      :label-width="100"
    >
      <Row>
        <Col span="18" offset="3" style="margin-top: 20px">
          <FormItem label="连接名称:" prop="connectName" class="title">
            <Input v-model="dataBaseInfo.connectName" placeholder="请输入连接名称" maxlength="30"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="18" offset="3">
          <FormItem label="数据库类型:" prop="databaseType" class="title">
            <Select v-model="dataBaseInfo.databaseType"  style="width:100%;text-align:left;" clearable placeholder="请选择数据库类型">
              <Option v-for="item in databaseTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="18" offset="3">
          <FormItem label="数据库地址:" prop="databaseAddress" class="title">
            <Input v-model="dataBaseInfo.databaseAddress" placeholder="请输入数据库地址" maxlength="30"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="18" offset="3">
          <FormItem label="数据库名称:" prop="databaseName" class="title">
            <Input v-model="dataBaseInfo.databaseName" placeholder="请输入数据库名称" maxlength="30"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="18" offset="3">
          <FormItem label="端口号:" prop="port" class="title">
            <Input v-model="dataBaseInfo.port" placeholder="请输入端口号" maxlength="30"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="18" offset="3">
          <FormItem label="用户名:" prop="username" class="title">
            <Input v-model="dataBaseInfo.username" placeholder="请输入用户名" maxlength="30"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="18" offset="3">
          <FormItem label="密码:" prop="password" class="title" >
            <Input v-model="dataBaseInfo.password" placeholder="请输入密码" maxlength="30" type="password" password></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="18" offset="3">
          <FormItem label="数据库说明:" prop="databaseDescription" class="title">
            <Input v-model="dataBaseInfo.databaseDescription"  type="textarea" :rows="3" maxlength="300" show-word-limit></Input>
          </FormItem>
        </Col>
      </Row>
      <Row style="margin-left:12.5%;">
          <el-button size="mini" type="primary" style="margin-left:100px;" @click="connectTest('dataBaseInfo')" :loading="testConnectShow">连接测试</el-button>
      </Row>
    </Form>
    <el-row class="bottomSide rowPadding">
        <el-col :span="3" :offset="16">
            <el-button @click="close" size="small">取 消</el-button>
        </el-col>
        <el-col :span="3">
            <el-button type="primary" @click="saveDatabaseInfo('dataBaseInfo')" size="small">确 定</el-button>
        </el-col>
    </el-row>
  </div>
  </el-dialog>
</template>
<script>
import electron from 'electron'
import Store from 'electron-store'
const son = electron.remote.getGlobal('son')
const store = new Store()
export default {
  data () {
    return {
      testConnectShow: false,
      dataBaseInfo: {
        connectName: '',
        databaseType: '1',
        databaseAddress: 'localhost',
        databaseName: '',
        port: '3306',
        username: 'root',
        password: '',
        databaseDescription: ''
      },
      dataBaseInfoRules: {
        connectName: [{ required: true, message: ' ', trigger: 'blur' }],
        databaseType: [{ required: true, message: ' ', trigger: 'change' }],
        databaseAddress: [{ required: true, message: ' ', trigger: 'blur' }],
        databaseName: [{ required: true, message: ' ', trigger: 'blur' }],
        port: [{ required: true, message: ' ', trigger: 'blur' }],
        username: [{ required: true, message: ' ', trigger: 'blur' }],
        password: [{ required: true, message: ' ', trigger: 'blur' }]
      },
      databaseTypeList: [
        { label: 'MySQL', value: '1' },
        { label: 'Mariadb', value: '4' },
        { label: 'SQLServer', value: '2' },
        { label: 'Oracle', value: '3' }
      ]
    }
  },

  methods: {
    saveDatabaseInfo (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$emit('dataBaseDialog', this.dataBaseInfo)
          this.showDialog = false
        } else {
          this.$message.error('请将信息填写完整')
        }
      })
    },
    close () {
      this.showDialog = false
    },
    async  connectTest (name) {
      this.testConnectShow = true
      const res = await son.send('connectTest', this.dataBaseInfo)
      if (res.result.code === 20000) {
        this.$message.success('连接成功')
      } else {
        console.log('connectTest', res.result)
        this.$message.error(res.result.message)
      }
      this.testConnectShow = false
    }
  },
  computed: {
    // 子组件和父组件进行双向绑定的方法
    showDialog: {
      get () {
        return this.isVisible
      },
      set (v) {
        this.$emit('update:isVisible', v)
      }
    }
  },
  props: {
    isVisible: {
      type: Boolean,
      default: () => false
    }
  }
}
</script>
