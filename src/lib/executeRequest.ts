import { HeaderPair, HttpMethod, RequestSnapshot, ResponseSnapshot } from '@/types'
import { filterSendableHeaders } from '@/lib/headers'

export interface ExecuteRequestOptions {
  method: HttpMethod
  url: string
  headers: HeaderPair[]
  body: string
  withCredentials: boolean
}

export interface ExecuteRequestResult {
  request: RequestSnapshot
  response: ResponseSnapshot
}

export async function executeRequest(opts: ExecuteRequestOptions): Promise<ExecuteRequestResult> {
  const activeHeaders = filterSendableHeaders(opts.headers.filter((h) => h.enabled && h.key.trim()))
  const headerRecord = Object.fromEntries(activeHeaders.map((h) => [h.key, h.value]))
  const started = performance.now()

  const res = await fetch(opts.url, {
    method: opts.method,
    headers: headerRecord,
    body: opts.method === 'GET' || opts.method === 'HEAD' ? undefined : opts.body || undefined,
    credentials: opts.withCredentials ? 'include' : 'omit',
  })
  const duration = Math.round(performance.now() - started)
  const body = await res.text()
  const responseHeaders: Record<string, string> = {}
  res.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  return {
    request: {
      method: opts.method,
      url: opts.url,
      headers: headerRecord,
      body: opts.body,
    },
    response: {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      body,
      duration,
    },
  }
}
