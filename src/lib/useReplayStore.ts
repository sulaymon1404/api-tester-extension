import { useState } from 'react'
import { ReplaySnapshot } from '@/types'
import { genId } from '@/lib/id'

export function useReplayStore() {
  const [snapshots, setSnapshots] = useState<ReplaySnapshot[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function add(data: Omit<ReplaySnapshot, 'id' | 'createdAt'>): ReplaySnapshot {
    const snapshot: ReplaySnapshot = { ...data, id: genId(), createdAt: Date.now() }
    setSnapshots((prev) => [...prev, snapshot])
    setSelectedId(snapshot.id)
    return snapshot
  }

  function select(id: string) {
    setSelectedId(id)
  }

  function remove(id: string) {
    const next = snapshots.filter((s) => s.id !== id)
    setSnapshots(next)
    if (selectedId === id) {
      setSelectedId(next[next.length - 1]?.id ?? null)
    }
  }

  function clear() {
    setSnapshots([])
    setSelectedId(null)
  }

  const selected = snapshots.find((s) => s.id === selectedId) ?? null

  return { snapshots, selectedId, selected, add, select, remove, clear }
}
