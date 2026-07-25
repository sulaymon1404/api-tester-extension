import { HeaderPair, HttpMethod } from '../types'

export function buildCurl(
  method: HttpMethod,
  url: string,
  headers: HeaderPair[],
  body: string
): string {
  const parts = [`curl -X ${method}`, `'${url}'`]

  headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      parts.push(`-H '${h.key}: ${h.value}'`)
    })

  if (body.trim() && method !== 'GET' && method !== 'HEAD') {
    parts.push(`--data '${body.replace(/'/g, "'\\''")}'`)
  }

  return parts.join(' \\\n  ')
}
