// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ProcessHost } = require('electron-re')

ProcessHost.registry('test1', (args) => {
  try {
    console.log('successfully')
    return { code: 20000, result: '成功' }
  } catch (e) {
    return { code: 50000, result: e }
  }
})
