import { useEffect, useState } from 'react'
import { HeaderPair, HttpMethod, RequestRecord, ResponseSnapshot } from '@/types'
import { genId } from '@/lib/id'
import { loadHistory, saveToHistory } from '@/lib/storage'
import { executeRequest } from '@/lib/executeRequest'
import { useReplayStore } from '@/lib/useReplayStore'

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
  const replayStore = useReplayStore()
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

    try {
      // Browsers forbid scripts from setting headers like Cookie/Host/Content-Length
      // (and HTTP/2 pseudo-headers like :authority) — fetch() throws "Invalid name"
      // if they're present. Session cookies are attached via `credentials: 'include'`
      // instead, which lets the browser manage them the normal way.
      const { request, response } = await executeRequest({ method, url, headers, body, withCredentials })
      replayStore.add({ request, response })

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
    replayStore.clear()
    setError(null)
  }

  function loadFromHistory(record: RequestRecord) {
    setMethod(record.method)
    setUrl(record.url)
    setHeaders(record.headers.length ? record.headers : [emptyHeader()])
    setBody(record.body)
    replayStore.clear()
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
    replayStore.clear()
    setError(null)
  }

  function addCapturedReplay(response: ResponseSnapshot) {
    const activeHeaders = headers.filter((h) => h.enabled && h.key.trim())
    replayStore.add({
      request: {
        method,
        url,
        headers: Object.fromEntries(activeHeaders.map((h) => [h.key, h.value])),
        body,
      },
      response,
    })
  }

  return {
    method,
    url,
    headers,
    body,
    withCredentials,
    replays: replayStore.snapshots,
    selectedReplayId: replayStore.selectedId,
    selectedReplay: replayStore.selected,
    selectReplay: replayStore.select,
    compareIds: replayStore.compareIds,
    comparePair: replayStore.comparePair,
    toggleCompare: replayStore.toggleCompare,
    loading,
    error,
    history,
    methods: METHODS,
    setMethod,
    setUrl,
    setBody,
    setWithCredentials,
    addCapturedReplay,
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
