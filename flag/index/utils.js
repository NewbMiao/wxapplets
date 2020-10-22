export const getHDAvatarUrl = (url) => {
  // https://developers.weixin.qq.com/community/develop/doc/0004a2e95c8d80ec53b653c6851c00
  let tmp = url.split('/')
  tmp[tmp.length - 1] = '0'
  return tmp.join('/')
}