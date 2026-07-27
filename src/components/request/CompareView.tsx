import { useMemo } from 'react'
import { X } from 'lucide-react'
import { ReplaySnapshot } from '@/types'
import {
  byteSize,
  diffHeaders,
  diffJson,
  diffText,
  tryParseJson,
  HeaderDiffEntry,
  JsonDiffEntry,
  TextDiffPart,
} from '@/lib/diff'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  before: ReplaySnapshot
  after: ReplaySnapshot
  onClose: () => void
}

function HeaderDiffList({ entries }: { entries: HeaderDiffEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">No header changes.</p>
  }
  return (
    <ul className="flex flex-col gap-1 text-xs">
      {entries.map((entry) => (
        <li key={entry.key} className="font-mono">
          <span className="text-muted-foreground">{entry.key}:</span>{' '}
          {entry.status === 'added' && <span className="text-success">+ {entry.after}</span>}
          {entry.status === 'removed' && <span className="text-destructive">- {entry.before}</span>}
          {entry.status === 'changed' && (
            <span>
              <span className="text-destructive line-through">{entry.before}</span>
              {' → '}
              <span className="text-success">{entry.after}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

function JsonDiffList({ entries }: { entries: JsonDiffEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">No differences.</p>
  }
  return (
    <ul className="flex flex-col gap-1 text-xs">
      {entries.map((entry) => (
        <li key={entry.path} className="font-mono">
          <span className="text-muted-foreground">{entry.path || '(root)'}:</span>{' '}
          {entry.status === 'added' && (
            <span className="text-success">+ {JSON.stringify(entry.after)}</span>
          )}
          {entry.status === 'removed' && (
            <span className="text-destructive">- {JSON.stringify(entry.before)}</span>
          )}
          {entry.status === 'changed' && (
            <span>
              <span className="text-destructive line-through">{JSON.stringify(entry.before)}</span>
              {' → '}
              <span className="text-success">{JSON.stringify(entry.after)}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

function TextDiffView({ parts }: { parts: TextDiffPart[] }) {
  return (
    <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap break-words text-xs">
      {parts.map((part, index) => (
        <span
          key={index}
          className={
            part.added
              ? 'bg-success/15 text-success'
              : part.removed
                ? 'bg-destructive/15 text-destructive'
                : undefined
          }
        >
          {part.value}
        </span>
      ))}
    </pre>
  )
}

type BodyDiffResult = { kind: 'json'; entries: JsonDiffEntry[] } | { kind: 'text'; parts: TextDiffPart[] }

function BodyDiff({ before, after }: { before: string; after: string }) {
  const result = useMemo<BodyDiffResult>(() => {
    const beforeJson = tryParseJson(before)
    const afterJson = tryParseJson(after)
    if (beforeJson.ok && afterJson.ok) {
      return { kind: 'json', entries: diffJson(beforeJson.value, afterJson.value) }
    }
    return { kind: 'text', parts: diffText(before, after) }
  }, [before, after])

  return result.kind === 'json' ? (
    <JsonDiffList entries={result.entries} />
  ) : (
    <TextDiffView parts={result.parts} />
  )
}

export default function CompareView({ before, after, onClose }: Props) {
  const requestHeaderDiff = useMemo(
    () => diffHeaders(before.request.headers, after.request.headers),
    [before.request.headers, after.request.headers]
  )
  const responseHeaderDiff = useMemo(
    () => diffHeaders(before.response.headers, after.response.headers),
    [before.response.headers, after.response.headers]
  )
  const beforeSize = useMemo(() => byteSize(before.response.body), [before.response.body])
  const afterSize = useMemo(() => byteSize(after.response.body), [after.response.body])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare</CardTitle>
        <button
          onClick={onClose}
          aria-label="Close comparison"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <section className="flex flex-col gap-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Request changes
          </h4>
          {before.request.method !== after.request.method && (
            <p className="text-xs">
              Method: <span className="text-destructive line-through">{before.request.method}</span>{' '}
              → <span className="text-success">{after.request.method}</span>
            </p>
          )}
          {before.request.url !== after.request.url && (
            <p className="break-words text-xs">
              URL: <span className="text-destructive line-through">{before.request.url}</span> →{' '}
              <span className="text-success">{after.request.url}</span>
            </p>
          )}
          <HeaderDiffList entries={requestHeaderDiff} />
          <BodyDiff before={before.request.body} after={after.request.body} />
        </section>

        <section className="flex flex-col gap-2 border-t border-border pt-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Response changes
          </h4>
          {before.response.status !== after.response.status && (
            <p className="text-xs">
              Status:{' '}
              <span className="text-destructive line-through">
                {before.response.status} {before.response.statusText}
              </span>{' '}
              →{' '}
              <span className="text-success">
                {after.response.status} {after.response.statusText}
              </span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Size: {beforeSize} B → {afterSize} B ({afterSize - beforeSize >= 0 ? '+' : ''}
            {afterSize - beforeSize} B)
          </p>
          <HeaderDiffList entries={responseHeaderDiff} />
          <BodyDiff before={before.response.body} after={after.response.body} />
        </section>
      </CardContent>
    </Card>
  )
}
