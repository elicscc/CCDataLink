/*
 * @Author: your name
 * @Date: 2020-10-09 09:09:24
 * @LastEditTime: 2020-12-09 14:39:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \DataLinkPlatform\app\utils\axiosForExecutor.js
 */
import axios, { AxiosPromise } from 'axios'
import log4j from './log4j'
import * as iconv from 'iconv-lite'
import md5 from 'js-md5'
import { getUrI, sortParam } from './signUtil'
import http from 'http'
import https from 'https'
import Agent from 'agentkeepalive'
const HttpsAgent = Agent.HttpsAgent

// 固定配置，平台方发放定义
const appId = 'DLT'
const version = '5.0'
const appSecret = '30c722c6acc64306a88dd93a814c9f0a'
const log = log4j.getLogger()
global.EXECUTOR_BASE_API = process.env.BASE_API
const axiosInstance = axios.create({
  httpAgent: new Agent({ keepAlive: true, timeout: 60000 * 100, freeSocketTimeout: 30000 }),
  httpsAgent: new HttpsAgent({ keepAlive: true, timeout: 60000 * 100, freeSocketTimeout: 30000, rejectUnauthorized: false }),
  maxContentLength: 1024 * 1024 * 1024 * 1024 * 1024,
  maxBodyLength: 1024 * 1024 * 1024 * 1024 * 1024,
  timeout: 60000 * 1000 // request timeout
})
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
    console.log('url is ', response.config.url, 'request params is', response.config.params, 'request data is ', response.config.data, 'response is', response.data)
    return response
  },
  error => {
    log.error('error is', error)
    return Promise.reject(error)
  }
)

export function get (url:string, urlParams = {}) :AxiosPromise {
  if (!url.startsWith('http')) {
    log.info('BASE_API', global.BASE_API)
    url = (global.BASE_API ? global.BASE_API : global.EXECUTOR_BASE_API) + url
  }
  return axiosInstance({
    url: url,
    method: 'get',
    params: urlParams
  })
}

export function post (url:string, body = {}, urlParams = {}):AxiosPromise {
  if (!url.startsWith('http')) {
    url = (global.BASE_API ? global.BASE_API : global.EXECUTOR_BASE_API) + url
  }
  return axiosInstance({
    url: url,
    method: 'post',
    params: urlParams,
    data: body,
    timeout: 60000 * 1000
  })
}

export function postWithAttach (url:string, formData:any, urlParams = {}):AxiosPromise {
  if (!url.startsWith('http')) {
    url = (global.BASE_API ? global.BASE_API : global.EXECUTOR_BASE_API) + url
  }
  return axiosInstance({
    url: url,
    method: 'post',
    params: urlParams,
    data: formData,
    headers: formData.getHeaders(),
    timeout: 60000 * 1000
  })
}
export const server = axiosInstance

/**
 * another instance for component
 */
const axiosInstanceForCmpt = axios.create({
  httpAgent: new Agent({ keepAlive: true, timeout: 60000 * 100, freeSocketTimeout: 30000 }),
  httpsAgent: new HttpsAgent({ keepAlive: true, timeout: 60000 * 100, freeSocketTimeout: 30000, rejectUnauthorized: false }),
  maxContentLength: 1024 * 1024 * 1024 * 1024 * 1024,
  maxBodyLength: 1024 * 1024 * 1024 * 1024 * 1024,
  timeout: 5 * 60 * 1000 // request timeout
})
axiosInstanceForCmpt.defaults.withCredentials = true // 携带cookies
axiosInstanceForCmpt.interceptors.response.use(
  response => {
    // log.info('url is ', response.config.url, 'request data is ', response.config.data, 'response is', response.data)
    return response
  },
  error => {
    log.error('error is', error)
    return Promise.reject(error)
  }
)

export const cmptAxios = axiosInstanceForCmpt

/**
 * another instance for component
 */
const axiosInstanceForCmptGbk = axios.create({
  httpAgent: new http.Agent({ keepAlive: true, timeout: 60000 * 1000 }),
  httpsAgent: new https.Agent({ keepAlive: true, timeout: 60000 * 1000, rejectUnauthorized: false }),
  maxContentLength: 1024 * 1024 * 1024 * 1024 * 1024,
  maxBodyLength: 1024 * 1024 * 1024 * 1024 * 1024,
  timeout: 3000 * 1000 // request timeout
})
axiosInstanceForCmptGbk.interceptors.response.use(
  response => {
    // log.info('url is ', response.config.url, 'request data is ', response.config.data, 'response is', response.data)
    return response
  },
  error => {
    log.error('error is', error)
    return Promise.reject(error)
  }
)

axiosInstanceForCmptGbk.defaults.withCredentials = true // 携带cookies
axiosInstanceForCmptGbk.defaults.responseType = 'arraybuffer'
axiosInstanceForCmptGbk.defaults.transformResponse = [function (data) {
  console.log('data is ', data.toString())
  const d = Buffer.from(data, 'utf8')
  data = iconv.decode(d, 'gbk')
  return data
}]

export const cmptAxiosGbk = axiosInstanceForCmptGbk
