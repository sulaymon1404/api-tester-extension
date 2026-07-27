import { type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { HeaderPair, HttpMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Radix Select reserves the empty string internally (it means "no selection"),
// so the "None" option needs its own sentinel that gets mapped back to '' at the edges.
const NONE_VALUE = '__none__'

const CONTENT_TYPES = [
  { label: 'JSON', mime: 'application/json', placeholder: '{"key": "value"}' },
  {
    label: 'Form URL-encoded',
    mime: 'application/x-www-form-urlencoded',
    placeholder: 'key1=value1&key2=value2',
  },
  { label: 'Plain text', mime: 'text/plain', placeholder: 'raw text body' },
  { label: 'None (custom header)', mime: '', placeholder: 'request body' },
]

interface Props {
  method: HttpMethod
  url: string
  headers: HeaderPair[]
  body: string
  withCredentials: boolean
  methods: HttpMethod[]
  onMethodChange: (m: HttpMethod) => void
  onUrlChange: (u: string) => void
  onHeaderChange: (id: string, patch: Partial<HeaderPair>) => void
  onAddHeader: () => void
  onRemoveHeader: (id: string) => void
  onBodyChange: (b: string) => void
  onWithCredentialsChange: (v: boolean) => void
  onContentTypeChange: (contentType: string) => void
  onSubmit: () => void
}

export default function RequestForm({
  method,
  url,
  headers,
  body,
  withCredentials,
  methods,
  onMethodChange,
  onUrlChange,
  onHeaderChange,
  onAddHeader,
  onRemoveHeader,
  onBodyChange,
  onWithCredentialsChange,
  onContentTypeChange,
  onSubmit,
}: Props) {
  const bodyDisabled = method === 'GET' || method === 'HEAD'

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  const rawContentType = headers.find((h) => h.key.toLowerCase() === 'content-type')?.value ?? ''
  const matchedType = CONTENT_TYPES.find((c) => c.mime === rawContentType)
  // Unrecognized/custom Content-Type values (e.g. "application/xml") leave the
  // dropdown showing its placeholder rather than forcing a match to "None".
  const selectValue = matchedType ? matchedType.mime || NONE_VALUE : ''
  const bodyPlaceholder = matchedType?.placeholder ?? CONTENT_TYPES[0].placeholder

  function handleContentTypeSelect(value: string) {
    onContentTypeChange(value === NONE_VALUE ? '' : value)
  }

  return (
    <div className="flex flex-col gap-3" onKeyDown={handleKeyDown}>
      <div className="flex gap-2">
        <Select value={method} onValueChange={(v) => onMethodChange(v as HttpMethod)}>
          <SelectTrigger className="w-24 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {methods.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="https://api.example.com/..."
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="flex-1"
        />
      </div>

      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Checkbox
          checked={withCredentials}
          onCheckedChange={(v) => onWithCredentialsChange(v === true)}
        />
        Include cookies from the current browser session
      </label>

      <Card>
        <CardHeader>
          <CardTitle>Headers</CardTitle>
          <Button variant="ghost" size="sm" onClick={onAddHeader}>
            <Plus /> Add
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {headers.length === 0 && (
            <p className="text-xs text-muted-foreground">No headers yet.</p>
          )}
          {headers.map((h) => (
            <div className="flex items-center gap-1.5" key={h.id}>
              <Checkbox
                checked={h.enabled}
                onCheckedChange={(v) => onHeaderChange(h.id, { enabled: v === true })}
              />
              <Input
                placeholder="Key"
                value={h.key}
                onChange={(e) => onHeaderChange(h.id, { key: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={h.value}
                onChange={(e) => onHeaderChange(h.id, { value: e.target.value })}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => onRemoveHeader(h.id)}>
                <X />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {!bodyDisabled && (
        <Card>
          <CardHeader>
            <CardTitle>Body</CardTitle>
            <Select value={selectValue} onValueChange={handleContentTypeSelect}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Content-Type" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((c) => (
                  <SelectItem key={c.label} value={c.mime || NONE_VALUE}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={bodyPlaceholder}
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              rows={6}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
