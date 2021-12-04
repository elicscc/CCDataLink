const parseUrl = function (href) {
  const obj = {}
  try {
    if (href && href.indexOf('?') > 0) {
      href = href.substr(href.indexOf('?') + 1)
      // #号后面的不算参数
      href = href.indexOf('#') ? href.substr(0, href.indexOf('#')) : href
      if (href.indexOf('&') > 0) {
        const urlParams = href.split('&')
        for (let i = 0; i < urlParams.length; i++) {
          const urlParam = urlParams[i].split('=')
          obj[urlParam[0]] = urlParam[1]
        }
      } else {
        const urlParam = href.split('=')
        obj[urlParam[0]] = urlParam[1]
      }
    }
  } catch (e) {
    console.log(e)
  }

  return obj
}
export default parseUrl
