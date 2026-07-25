import { Compass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function App() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Compass className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold">API Tester lives in DevTools</span>
      </div>

      <p className="text-xs text-muted-foreground">
        This isn't a popup tool — it's a tab inside Chrome DevTools, right next to Elements and
        Console, so it can see the page's real network traffic and session cookies.
      </p>

      <Card>
        <CardContent className="flex flex-col gap-2 text-xs">
          <div>
            <span className="font-semibold text-foreground">1.</span> Open DevTools on any page —{' '}
            <kbd className="rounded border border-border px-1 py-0.5 font-mono">F12</kbd>, or{' '}
            <kbd className="rounded border border-border px-1 py-0.5 font-mono">Ctrl+Shift+I</kbd>{' '}
            (Windows/Linux) /{' '}
            <kbd className="rounded border border-border px-1 py-0.5 font-mono">Cmd+Option+I</kbd>{' '}
            (Mac)
          </div>
          <div>
            <span className="font-semibold text-foreground">2.</span> Click the{' '}
            <span className="font-semibold text-foreground">API Tester</span> tab in the DevTools
            tab bar (you may need the »  overflow menu if the bar is narrow)
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">
        Chrome doesn't let extensions open DevTools automatically — that's a browser restriction,
        not a missing feature — so this step is manual every time.
      </p>
    </div>
  )
}
