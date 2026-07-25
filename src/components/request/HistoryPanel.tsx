import { RequestRecord } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HistoryPanel({
  history,
  onSelect,
}: {
  history: RequestRecord[]
  onSelect: (record: RequestRecord) => void
}) {
  if (history.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      <CardContent className="flex max-h-40 flex-col gap-0.5 overflow-y-auto p-1.5">
        {history.map((record) => (
          <button
            key={record.id}
            onClick={() => onSelect(record)}
            className="flex items-center gap-2 rounded-sm px-1.5 py-1 text-left text-xs hover:bg-accent"
          >
            <Badge variant="outline" className="w-14 shrink-0 justify-center">
              {record.method}
            </Badge>
            <span className="truncate text-foreground/90">{record.url}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
