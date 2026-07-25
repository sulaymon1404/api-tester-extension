import { ResponseData } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function prettify(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
}

function statusVariant(status: number): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  if (status >= 400) return 'destructive'
  return 'secondary'
}

export default function ResponseView({ response }: { response: ResponseData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(response.status)}>
            {response.status} {response.statusText}
          </Badge>
          <span className="text-xs text-muted-foreground">{response.timeMs} ms</span>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap break-words text-xs">
          {prettify(response.body)}
        </pre>
      </CardContent>
    </Card>
  )
}
