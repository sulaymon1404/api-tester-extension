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

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  timeMs: number
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
