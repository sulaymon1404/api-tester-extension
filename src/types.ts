export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export interface HeaderPair {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface RequestRecord {
  id: string
  method: HttpMethod
  url: string
  headers: HeaderPair[]
  body: string
  createdAt: number
}

export interface RequestSnapshot {
  method: HttpMethod
  url: string
  headers: Record<string, string>
  body: string
}

export interface ResponseSnapshot {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  duration: number
}

export interface ReplaySnapshot {
  id: string
  createdAt: number
  request: RequestSnapshot
  response: ResponseSnapshot
}

export interface CapturedRequest {
  id: string
  method: string
  url: string
  status: number
  statusText: string
  requestHeaders: HeaderPair[]
  requestBody: string
  resourceType?: string
  timeMs: number
}
