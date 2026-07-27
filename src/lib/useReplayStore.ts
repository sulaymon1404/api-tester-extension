import { useState } from 'react'
import { ReplaySnapshot } from '@/types'
import { genId } from '@/lib/id'

export function useReplayStore() {
  const [snapshots, setSnapshots] = useState<ReplaySnapshot[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>([])

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
    setCompareIds((prev) => prev.filter((i) => i !== id))
  }

  function clear() {
    setSnapshots([])
    setSelectedId(null)
    setCompareIds([])
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const selected = snapshots.find((s) => s.id === selectedId) ?? null

  const comparePair: [ReplaySnapshot, ReplaySnapshot] | null =
    compareIds.length === 2
      ? (snapshots.filter((s) => compareIds.includes(s.id)) as [ReplaySnapshot, ReplaySnapshot])
      : null

  return {
    snapshots,
    selectedId,
    selected,
    compareIds,
    comparePair,
    add,
    select,
    remove,
    clear,
    toggleCompare,
  }
}
