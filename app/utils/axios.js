import axios from 'axios'
import electron from 'electron'
import { Message } from 'element-ui'
import md5 from 'js-md5'
import { getUrI, sortParam } from './signUtil'

// 固定配置，平台方发放定义
const appId = 'DLT'
const version = '5.0'
const appSecret = '30c722c6acc64306a88dd93a814c9f0a'

const axiosInstance = axios.create({
  maxContentLength: 1024 * 1024 * 1024 * 1024 * 1024,
  maxBodyLength: 1024 * 1024 * 1024 * 1024 * 1024,
  baseURL: '',
  timeout: 60000 * 1000 // request timeout
})
axiosInstance.defaults.crossDomain = true
axiosInstance.defaults.headers.token = null

// request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // do something before request is sent
    const timestamp = new Date().getTime()
    const nonce = Math.floor(Math.random() * 100000)
    const body = config.data ? JSON.stringify(config.data) : ''
    const signStr = getUrI(config.url) + appId + appSecret + sortParam(config.params, config.url) + timestamp + nonce + version + body
    const sign = md5(signStr)
    // console.log(signStr, sign, '----------------------------------')

    const headers = config.headers
    headers.appId = appId
    headers.timestamp = timestamp
    headers.nonce = nonce
    headers.sign = sign
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  /*
   * If you want to get http information such as headers or status
   * Please return  response => response
   */
  response => {
    const responseData = response.data
    console.log('url is ', response.config.url, 'request params is', response.config.params, 'request data is ', response.config.data, 'response is', response.data)
    // if the custom code is not 0000, it is judged as an error.
    if (responseData.resultCode !== '0000') {
      Message({
        message: responseData.resultMsg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      return Promise.reject(new Error(responseData.resultMsg || 'Error'))
    } else {
      return response
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export const server = axiosInstance
