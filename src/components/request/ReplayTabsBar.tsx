import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReplaySnapshot } from '@/types'

function labelFor(index: number): string {
  return index === 0 ? 'Original' : `Replay #${index}`
}

interface Props {
  replays: ReplaySnapshot[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function ReplayTabsBar({ replays, selectedId, onSelect }: Props) {
  if (replays.length === 0) return null

  return (
    <Tabs value={selectedId ?? undefined} onValueChange={onSelect}>
      <TabsList className="flex-wrap">
        {replays.map((replay, index) => (
          <TabsTrigger key={replay.id} value={replay.id}>
            {labelFor(index)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
