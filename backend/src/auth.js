export function getLoginIdentifier(body = {}) {
  return body.loginId || body.username || body.rollNumber || '';
}
