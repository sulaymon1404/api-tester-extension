import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'API Tester — Session-Aware API Client',
  version: '0.1.0',
  description:
    "Test API requests using the current tab's live session — cookies included automatically, no copy-pasting tokens.",
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'API Tester — open DevTools and look for the API Tester tab',
  },
  devtools_page: 'src/devtools/index.html',
  permissions: ['storage'],
  host_permissions: ['<all_urls>'],
})
