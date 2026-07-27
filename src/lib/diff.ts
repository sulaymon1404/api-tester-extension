import { diffLines } from 'diff'

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged'

export interface HeaderDiffEntry {
  key: string
  before?: string
  after?: string
  status: DiffStatus
}

export interface JsonDiffEntry {
  path: string
  before?: unknown
  after?: unknown
  status: DiffStatus
}

export interface TextDiffPart {
  value: string
  added?: boolean
  removed?: boolean
}

export type JsonParseResult = { ok: true; value: unknown } | { ok: false }

export function tryParseJson(body: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(body) }
  } catch {
    return { ok: false }
  }
}

export function byteSize(text: string): number {
  return new TextEncoder().encode(text).length
}

export function diffHeaders(
  before: Record<string, string>,
  after: Record<string, string>
): HeaderDiffEntry[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  const entries: HeaderDiffEntry[] = []

  for (const key of keys) {
    const hasBefore = key in before
    const hasAfter = key in after

    if (hasBefore && !hasAfter) {
      entries.push({ key, before: before[key], status: 'removed' })
    } else if (!hasBefore && hasAfter) {
      entries.push({ key, after: after[key], status: 'added' })
    } else if (before[key] !== after[key]) {
      entries.push({ key, before: before[key], after: after[key], status: 'changed' })
    }
  }

  return entries.sort((a, b) => a.key.localeCompare(b.key))
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function diffJson(before: unknown, after: unknown): JsonDiffEntry[] {
  const entries: JsonDiffEntry[] = []
  walk('', before, after, entries)
  return entries
}

function walk(path: string, before: unknown, after: unknown, out: JsonDiffEntry[]): void {
  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    for (const key of keys) {
      walk(path ? `${path}.${key}` : key, before[key], after[key], out)
    }
    return
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length)
    for (let i = 0; i < length; i++) {
      walk(`${path}[${i}]`, before[i], after[i], out)
    }
    return
  }

  const beforeDefined = before !== undefined
  const afterDefined = after !== undefined

  if (beforeDefined && !afterDefined) {
    out.push({ path, before, status: 'removed' })
  } else if (!beforeDefined && afterDefined) {
    out.push({ path, after, status: 'added' })
  } else if (JSON.stringify(before) !== JSON.stringify(after)) {
    out.push({ path, before, after, status: 'changed' })
  }
}

export function diffText(before: string, after: string): TextDiffPart[] {
  return diffLines(before, after).map((part) => ({
    value: part.value,
    added: part.added,
    removed: part.removed,
  }))
}
