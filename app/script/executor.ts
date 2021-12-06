import log4j from '../utils/log4j'
import express from 'express'

import InitEnvVariable from './initEnvVariable'

const logger = log4j.getLogger()
// 产品类型 toc tob

const app = express()
app.use(express.json({ limit: '50mb' }))

// initial environment variable
InitEnvVariable.init()

const server = app.listen(3000, function () {
  console.log(' app listening at http://%s', server.address())
})

logger.info('hello world')
InitEnvVariable.initJava()
