export function sortParam (params, url) {
  const arr = []

  const urlObj = parseUrlToObj(url)
  params = Object.assign(params || {}, urlObj)
  let num = 0
  for (const i in params) {
    arr[num] = i
    num++
  }
  const sortArr = arr.sort()
  let sortParams = ''
  for (const i in sortArr) {
    const key = sortArr[i]
    const value = params[key]
    if (key == null || value == null) {
      continue
    }
    sortParams = sortParams + sortArr[i] + params[sortArr[i]]
  }
  return sortParams
}

function parseUrlToObj (url) {
  const urlReg = /^[^?]+\?([\w\W]+)$/
  const paramReg = /([^&=]+)=([\w\W]*?)(&|$|#)/g
  const urlArray = urlReg.exec(url)
  const result = {}
  if (urlArray && urlArray[1]) {
    const paramString = urlArray[1]
    let paramResult
    while ((paramResult = paramReg.exec(paramString)) != null) {
      result[paramResult[1]] = paramResult[2]
    }
  }
  return result
}

export function getUrI (url) {
  const index = url.indexOf('?')
  let uri = url
  if (index > 0) {
    uri = url.substring(0, index)
  }
  if (uri.startsWith('http')) {
    uri = uri.replace(global.BASE_API, '')
  }
  // 为了兼容ToB的版本
  const tobContextPath = '/dlt-job-admin'
  if (uri.startsWith(tobContextPath)) {
    uri = uri.replace(tobContextPath, '')
  }
  return uri
}
