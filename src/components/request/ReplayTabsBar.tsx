import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ReplaySnapshot } from '@/types'

function labelFor(index: number): string {
  return index === 0 ? 'Original' : `Replay #${index}`
}

interface Props {
  replays: ReplaySnapshot[]
  selectedId: string | null
  onSelect: (id: string) => void
  compareIds: string[]
  onToggleCompare: (id: string) => void
  onCompare: () => void
}

export default function ReplayTabsBar({
  replays,
  selectedId,
  onSelect,
  compareIds,
  onToggleCompare,
  onCompare,
}: Props) {
  if (replays.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs value={selectedId ?? undefined} onValueChange={onSelect}>
        <TabsList className="flex-wrap">
          {replays.map((replay, index) => (
            <div key={replay.id} className="flex items-center gap-1 pl-1.5">
              <Checkbox
                checked={compareIds.includes(replay.id)}
                onCheckedChange={() => onToggleCompare(replay.id)}
                disabled={compareIds.length >= 2 && !compareIds.includes(replay.id)}
              />
              <TabsTrigger value={replay.id}>{labelFor(index)}</TabsTrigger>
            </div>
          ))}
        </TabsList>
      </Tabs>
      <Button variant="secondary" size="sm" disabled={compareIds.length !== 2} onClick={onCompare}>
        Compare
      </Button>
    </div>
  )
}
