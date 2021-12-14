import { uuid } from 'vue-uuid'
export default {

  methods: {
    // 返回唯一标识
    getUUID () {
      return uuid.v1()
    }
  }
}
