import { useMemo } from 'react'
import { ReplaySnapshot } from '@/types'
import { tryParseJson } from '@/lib/diff'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import JsonTreeView from '@/components/request/JsonTreeView'

function statusVariant(status: number): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  if (status >= 400) return 'destructive'
  return 'secondary'
}

export default function ResponseView({ snapshot }: { snapshot: ReplaySnapshot }) {
  const { response } = snapshot
  const parsed = useMemo(() => tryParseJson(response.body), [response.body])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(response.status)}>
            {response.status} {response.statusText}
          </Badge>
          <span className="text-xs text-muted-foreground">{response.duration} ms</span>
        </div>
      </CardHeader>
      <CardContent>
        {parsed.ok ? (
          <JsonTreeView key={snapshot.id} value={parsed.value} />
        ) : (
          <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap break-words text-xs">
            {response.body}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}
