import { RequestRecord } from '../types'

const HISTORY_KEY = 'requestHistory'
const MAX_HISTORY = 20

export async function loadHistory(): Promise<RequestRecord[]> {
  const result = await chrome.storage.local.get(HISTORY_KEY)
  return result[HISTORY_KEY] ?? []
}

export async function saveToHistory(record: RequestRecord): Promise<RequestRecord[]> {
  const current = await loadHistory()
  const next = [record, ...current].slice(0, MAX_HISTORY)
  await chrome.storage.local.set({ [HISTORY_KEY]: next })
  return next
}
