import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CapturedRequest, HeaderPair } from '@/types'
import { genId } from '@/lib/id'
import { isSendableHeaderName } from '@/lib/headers'

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary'

function toHeaderPairs(headers: { name: string; value: string }[] | undefined): HeaderPair[] {
  return (headers ?? [])
    .filter((h) => isSendableHeaderName(h.name))
    .map((h) => ({ id: genId(), key: h.name, value: h.value, enabled: true }))
}

function statusVariant(status: number): BadgeVariant {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  if (status >= 400) return 'destructive'
  return 'secondary'
}

interface Props {
  onSelect: (request: CapturedRequest, raw: chrome.devtools.network.Request) => void
}

export default function NetworkList({ onSelect }: Props) {
  const [entries, setEntries] = useState<{ entry: CapturedRequest; raw: chrome.devtools.network.Request }[]>(
    []
  )
  const [apiOnly, setApiOnly] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    function handleFinished(request: chrome.devtools.network.Request) {
      const resourceType = (request as unknown as { _resourceType?: string })._resourceType
      const entry: CapturedRequest = {
        id: genId(),
        method: request.request.method,
        url: request.request.url,
        status: request.response.status,
        statusText: request.response.statusText,
        requestHeaders: toHeaderPairs(request.request.headers),
        requestBody: request.request.postData?.text ?? '',
        resourceType,
        timeMs: Math.round(request.time),
      }
      setEntries((prev) => [{ entry, raw: request }, ...prev].slice(0, 300))
    }

    chrome.devtools.network.onRequestFinished.addListener(handleFinished)
    return () => chrome.devtools.network.onRequestFinished.removeListener(handleFinished)
  }, [])

  const filtered = entries.filter(({ entry }) => {
    if (apiOnly && entry.resourceType && !['xhr', 'fetch'].includes(entry.resourceType.toLowerCase())) {
      return false
    }
    if (search && !entry.url.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter by URL…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <label className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
          <Checkbox checked={apiOnly} onCheckedChange={(v) => setApiOnly(v === true)} />
          XHR/Fetch only
        </label>
        <Button variant="ghost" size="icon" onClick={() => setEntries([])} title="Clear captured requests">
          <Trash2 />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-md border border-border">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No requests captured yet — reload the page or interact with the site to see traffic here.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map(({ entry, raw }) => (
              <li
                key={entry.id}
                onClick={() => onSelect(entry, raw)}
                className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-accent"
              >
                <Badge variant="outline" className="w-14 shrink-0 justify-center">
                  {entry.method}
                </Badge>
                <Badge variant={statusVariant(entry.status)} className="w-11 shrink-0 justify-center">
                  {entry.status || '—'}
                </Badge>
                <span className="flex-1 truncate text-foreground/90">{entry.url}</span>
                <span className="shrink-0 text-muted-foreground">{entry.timeMs}ms</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
