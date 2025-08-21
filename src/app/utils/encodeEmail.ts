export function encodeEmail(email: string) {
  return Buffer.from(email).toString('base64')
}

export function decodeEmail(encoded: string) {
  return Buffer.from(encoded, 'base64').toString('utf8')
}
