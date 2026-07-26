import { useState } from 'react'
import { FilePlus, Send, Terminal, X } from 'lucide-react'
import { useRequestBuilder } from '@/lib/useRequestBuilder'
import { buildCurl } from '@/lib/curl'
import { copyToClipboard } from '@/lib/clipboard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RequestForm from '@/components/request/RequestForm'
import ResponseView from '@/components/request/ResponseView'
import ReplayTabsBar from '@/components/request/ReplayTabsBar'
import HistoryPanel from '@/components/request/HistoryPanel'
import NetworkList from './components/NetworkList'
import { CapturedRequest } from '@/types'

export default function App() {
  const rb = useRequestBuilder()
  const [curlPreview, setCurlPreview] = useState<{ text: string; copied: boolean } | null>(null)

  function handleNewRequest() {
    rb.resetRequest()
    setCurlPreview(null)
  }

  function handleContentTypeChange(contentType: string) {
    if (contentType) {
      rb.upsertHeader('Content-Type', contentType)
    } else {
      rb.removeHeaderByKey('Content-Type')
    }
  }

  function copyAsCurl() {
    const curl = buildCurl(rb.method, rb.url, rb.headers, rb.body)
    const copied = copyToClipboard(curl)
    setCurlPreview({ text: curl, copied })
  }

  function handleSelectCaptured(entry: CapturedRequest, raw: chrome.devtools.network.Request) {
    rb.loadFromCaptured(entry)

    raw.getContent((content, encoding) => {
      const body = encoding === 'base64' && content ? atob(content) : content ?? ''
      const responseHeaders: Record<string, string> = {}
      raw.response.headers?.forEach((h) => {
        responseHeaders[h.name] = h.value
      })

      rb.addCapturedReplay({
        status: entry.status,
        statusText: entry.statusText,
        headers: responseHeaders,
        body,
        duration: entry.timeMs,
      })
    })
  }

  return (
    <div className="grid h-screen grid-cols-[minmax(280px,1fr)_minmax(380px,1.3fr)] gap-3 p-3">
      <div className="flex min-h-0 flex-col">
        <Tabs defaultValue="network" className="flex min-h-0 flex-1 flex-col gap-2">
          <TabsList>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent
            value="network"
            forceMount
            className="min-h-0 flex-1 data-[state=inactive]:hidden"
          >
            <NetworkList onSelect={handleSelectCaptured} />
          </TabsContent>
          <TabsContent
            value="history"
            forceMount
            className="min-h-0 flex-1 overflow-y-auto data-[state=inactive]:hidden"
          >
            <HistoryPanel history={rb.history} onSelect={rb.loadFromHistory} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Request
          </span>
          <Button variant="ghost" size="sm" onClick={handleNewRequest}>
            <FilePlus /> New request
          </Button>
        </div>

        <RequestForm
          method={rb.method}
          url={rb.url}
          headers={rb.headers}
          body={rb.body}
          withCredentials={rb.withCredentials}
          methods={rb.methods}
          onMethodChange={rb.setMethod}
          onUrlChange={rb.setUrl}
          onHeaderChange={rb.updateHeader}
          onAddHeader={rb.addHeader}
          onRemoveHeader={rb.removeHeader}
          onBodyChange={rb.setBody}
          onWithCredentialsChange={rb.setWithCredentials}
          onContentTypeChange={handleContentTypeChange}
        />

        <div className="flex gap-2">
          <Button onClick={rb.sendRequest} disabled={rb.loading || !rb.url}>
            <Send /> {rb.loading ? 'Sending…' : 'Send'}
          </Button>
          <Button variant="secondary" onClick={copyAsCurl} disabled={!rb.url}>
            <Terminal /> Copy as curl
          </Button>
        </div>

        {curlPreview && (
          <div className="rounded-md border border-border p-2">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {curlPreview.copied
                  ? 'Copied to clipboard'
                  : "Couldn't auto-copy here — click the text below, then Ctrl/Cmd+C"}
              </span>
              <button onClick={() => setCurlPreview(null)} className="hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <textarea
              readOnly
              value={curlPreview.text}
              onFocus={(e) => e.currentTarget.select()}
              rows={3}
              className="w-full resize-none rounded border border-border bg-transparent p-1.5 font-mono text-[11px]"
            />
          </div>
        )}

        {rb.error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
            {rb.error}
          </div>
        )}
        {rb.replays.length > 0 && (
          <>
            <ReplayTabsBar
              replays={rb.replays}
              selectedId={rb.selectedReplayId}
              onSelect={rb.selectReplay}
            />
            {rb.selectedReplay && <ResponseView snapshot={rb.selectedReplay} />}
          </>
        )}
      </div>
    </div>
  )
}
