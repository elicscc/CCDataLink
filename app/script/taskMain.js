import java from 'java'
import { MessageChannel } from 'electron-re'
const msgc = MessageChannel
console.log('start mianjs')
// msgc.handle('test', (event, rsp) => {
//   console.log('接受')
//   return msgc.invoke('app2', 'test2', rsp)
// })
msgc.on('test_java', (event, args) => {
  console.log('接受到了')
  try {
    // const TableInputService = java.import('com.dataqiao.dlt.db.TableInputService')
    // const service = new TableInputService()
    // service.testConnectSync(JSON.stringify(args))
    msgc.sendTo(event.senderId, 'test_replay', { code: 20000, result: '成功' })
  } catch (e) {
    msgc.sendTo(event.senderId, 'test_replay', { error: 50000, result: e })
  }
})
