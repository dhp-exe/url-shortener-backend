function encodeBase62(num) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  if (num === 0) return chars[0]
  let result = ''
  while (num > 0) {
    result = chars[num % 62] + result
    num = Math.floor(num / 62)
  }
  return result || '0'
}

module.exports = encodeBase62;