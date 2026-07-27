import { createContext, useContext, useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, Copy, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/clipboard'

// +1 versus the visual nesting the spec's example shows: the root value itself is always
// Node depth 0 (an unlabeled wrapper row), so matching "3 levels open" from the example means
// expanding one level deeper than that.
const DEFAULT_EXPAND_DEPTH = 4

type ExpandMode = 'default' | 'expand' | 'collapse'

interface TreeState {
  isExpanded: (path: string, depth: number) => boolean
  toggle: (path: string, depth: number) => void
}

const TreeContext = createContext<TreeState | null>(null)

function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === 'object' && value !== null
}

function primitiveClassName(value: unknown): string {
  if (value === null) return 'text-muted-foreground italic'
  switch (typeof value) {
    case 'string':
      return 'text-success'
    case 'number':
      return 'text-primary'
    case 'boolean':
      return 'text-warning'
    default:
      return 'text-muted-foreground'
  }
}

function formatPrimitive(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

function CopyButtons({ path, value }: { path: string; value: unknown }) {
  return (
    <span className="ml-1 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100">
      <button
        type="button"
        title="Copy value"
        aria-label="Copy value"
        onClick={() => copyToClipboard(JSON.stringify(value))}
        className="text-muted-foreground hover:text-foreground"
      >
        <Copy className="h-3 w-3" />
      </button>
      <button
        type="button"
        title="Copy JSON path"
        aria-label="Copy JSON path"
        onClick={() => copyToClipboard(path || '(root)')}
        className="text-muted-foreground hover:text-foreground"
      >
        <Link2 className="h-3 w-3" />
      </button>
    </span>
  )
}

function Node({
  path,
  depth,
  keyLabel,
  value,
}: {
  path: string
  depth: number
  keyLabel?: string
  value: unknown
}) {
  const tree = useContext(TreeContext)!

  if (isContainer(value)) {
    const isArray = Array.isArray(value)
    const entries: [string, unknown][] = isArray
      ? value.map((v, i) => [String(i), v])
      : Object.entries(value)
    const expanded = tree.isExpanded(path, depth)

    return (
      <div>
        <div className="group flex items-center gap-1">
          <button
            type="button"
            onClick={() => tree.toggle(path, depth)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {keyLabel !== undefined && <span className="text-foreground/70">{keyLabel}:</span>}
          <span className="text-muted-foreground">
            {isArray ? `Array(${entries.length})` : `Object(${entries.length})`}
          </span>
          <CopyButtons path={path} value={value} />
        </div>
        {expanded && (
          <div className="ml-2 border-l border-border pl-2">
            {entries.map(([key, child]) => (
              <Node
                key={key}
                path={isArray ? `${path}[${key}]` : path ? `${path}.${key}` : key}
                depth={depth + 1}
                keyLabel={isArray ? undefined : key}
                value={child}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-1">
      {keyLabel !== undefined && <span className="text-foreground/70">{keyLabel}:</span>}
      <span className={`whitespace-pre-wrap break-words ${primitiveClassName(value)}`}>
        {formatPrimitive(value)}
      </span>
      <CopyButtons path={path} value={value} />
    </div>
  )
}

export default function JsonTreeView({ value }: { value: unknown }) {
  const [mode, setMode] = useState<ExpandMode>('default')
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())

  const isExpanded = useCallback(
    (path: string, depth: number) => {
      if (overrides.has(path)) return overrides.get(path)!
      if (mode === 'expand') return true
      if (mode === 'collapse') return false
      return depth < DEFAULT_EXPAND_DEPTH
    },
    [overrides, mode]
  )

  const toggle = useCallback(
    (path: string, depth: number) => {
      setOverrides((prev) => {
        const next = new Map(prev)
        next.set(path, !isExpanded(path, depth))
        return next
      })
    },
    [isExpanded]
  )

  function expandAll() {
    setMode('expand')
    setOverrides(new Map())
  }

  function collapseAll() {
    setMode('collapse')
    setOverrides(new Map())
  }

  return (
    <TreeContext.Provider value={{ isExpanded, toggle }}>
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand all
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
        <div className="max-h-72 overflow-y-auto font-mono text-xs">
          <Node path="" depth={0} value={value} />
        </div>
      </div>
    </TreeContext.Provider>
  )
}
