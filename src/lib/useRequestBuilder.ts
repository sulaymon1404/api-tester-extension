import { useEffect, useState } from 'react'
import { HeaderPair, HttpMethod, RequestRecord, ResponseData } from '@/types'
import { genId } from '@/lib/id'
import { loadHistory, saveToHistory } from '@/lib/storage'
import { filterSendableHeaders } from '@/lib/headers'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']

function emptyHeader(): HeaderPair {
  return { id: genId(), key: '', value: '', enabled: true }
}

export function useRequestBuilder() {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<HeaderPair[]>([emptyHeader()])
  const [body, setBody] = useState('')
  const [withCredentials, setWithCredentials] = useState(true)
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<RequestRecord[]>([])

  useEffect(() => {
    loadHistory().then(setHistory)
  }, [])

  function updateHeader(id: string, patch: Partial<HeaderPair>) {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)))
  }

  function addHeader() {
    setHeaders((prev) => [...prev, emptyHeader()])
  }

  function removeHeader(id: string) {
    setHeaders((prev) => prev.filter((h) => h.id !== id))
  }

  function upsertHeader(key: string, value: string) {
    setHeaders((prev) => {
      const existing = prev.find((h) => h.key.toLowerCase() === key.toLowerCase())
      if (existing) {
        return prev.map((h) => (h.id === existing.id ? { ...h, value, enabled: true } : h))
      }
      return [...prev, { id: genId(), key, value, enabled: true }]
    })
  }

  function removeHeaderByKey(key: string) {
    setHeaders((prev) => prev.filter((h) => h.key.toLowerCase() !== key.toLowerCase()))
  }

  async function sendRequest() {
    if (!url) return
    setLoading(true)
    setError(null)
    setResponse(null)

    // Browsers forbid scripts from setting headers like Cookie/Host/Content-Length
    // (and HTTP/2 pseudo-headers like :authority) — fetch() throws "Invalid name"
    // if they're present. Session cookies are attached via `credentials: 'include'`
    // instead, which lets the browser manage them the normal way.
    const activeHeaders = filterSendableHeaders(headers.filter((h) => h.enabled && h.key.trim()))
    const headerRecord = Object.fromEntries(activeHeaders.map((h) => [h.key, h.value]))
    const started = performance.now()

    try {
      const res = await fetch(url, {
        method,
        headers: headerRecord,
        body: method === 'GET' || method === 'HEAD' ? undefined : body || undefined,
        credentials: withCredentials ? 'include' : 'omit',
      })
      const timeMs = Math.round(performance.now() - started)
      const text = await res.text()
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        resHeaders[key] = value
      })

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: text,
        timeMs,
      })

      const record: RequestRecord = {
        id: genId(),
        method,
        url,
        headers,
        body,
        createdAt: Date.now(),
      }
      setHistory(await saveToHistory(record))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  function resetRequest() {
    setMethod('GET')
    setUrl('')
    setHeaders([emptyHeader()])
    setBody('')
    setResponse(null)
    setError(null)
  }

  function loadFromHistory(record: RequestRecord) {
    setMethod(record.method)
    setUrl(record.url)
    setHeaders(record.headers.length ? record.headers : [emptyHeader()])
    setBody(record.body)
    setResponse(null)
    setError(null)
  }

  function loadFromCaptured(entry: {
    method: string
    url: string
    requestHeaders: HeaderPair[]
    requestBody: string
  }) {
    const normalizedMethod = METHODS.includes(entry.method as HttpMethod)
      ? (entry.method as HttpMethod)
      : 'GET'
    setMethod(normalizedMethod)
    setUrl(entry.url)
    setHeaders(entry.requestHeaders.length ? entry.requestHeaders : [emptyHeader()])
    setBody(entry.requestBody)
    setResponse(null)
    setError(null)
  }

  return {
    method,
    url,
    headers,
    body,
    withCredentials,
    response,
    loading,
    error,
    history,
    methods: METHODS,
    setMethod,
    setUrl,
    setBody,
    setWithCredentials,
    setResponse,
    updateHeader,
    addHeader,
    removeHeader,
    upsertHeader,
    removeHeaderByKey,
    sendRequest,
    resetRequest,
    loadFromHistory,
    loadFromCaptured,
  }
}
