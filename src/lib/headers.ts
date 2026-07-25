import { HeaderPair } from '@/types'

// Header names a script can never set via fetch()/XHR — the browser manages
// these itself (Fetch spec "forbidden request-header name" list, trimmed to
// the ones actually seen in captured traffic).
const FORBIDDEN_HEADERS = new Set([
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'cookie',
  'cookie2',
  'date',
  'dnt',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'set-cookie',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'via',
])

export function isSendableHeaderName(name: string): boolean {
  const trimmed = name.trim().toLowerCase()
  if (!trimmed) return false
  if (trimmed.startsWith(':')) return false // HTTP/2 pseudo-headers (:authority, :method, ...)
  if (trimmed.startsWith('proxy-') || trimmed.startsWith('sec-')) return false
  return !FORBIDDEN_HEADERS.has(trimmed)
}

export function filterSendableHeaders(headers: HeaderPair[]): HeaderPair[] {
  return headers.filter((h) => isSendableHeaderName(h.key))
}
