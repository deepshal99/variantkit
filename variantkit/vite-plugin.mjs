// VariantKit vite plugin — dev-only decision transport. The panel's finalize button
// POSTs the decision here; we write it to .variantkit/decisions/<Component>.json and
// append a line to .variantkit/history/log.jsonl. The agent applies pending decisions
// per AGENT.md §4. Add to vite.config:
//
//   import variantkit from './variantkit/vite-plugin.mjs'   // or src/variantkit/...
//   export default defineConfig({ plugins: [react(), variantkit()] })

import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'

const NAME_OK = /^[A-Za-z0-9_-]+$/

export default function variantkit() {
  return {
    name: 'variantkit',
    apply: 'serve', // dev server only — never part of a production build
    configureServer(server) {
      server.middlewares.use('/__variantkit/decision', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('method not allowed')
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const decision = JSON.parse(body)
            const component = String(decision.component ?? '')
            if (!NAME_OK.test(component)) {
              res.statusCode = 400
              res.end('invalid component name')
              return
            }
            const root = server.config.root ?? process.cwd()
            const dir = join(root, '.variantkit', 'decisions')
            const historyDir = join(root, '.variantkit', 'history')
            mkdirSync(dir, { recursive: true })
            mkdirSync(historyDir, { recursive: true })
            writeFileSync(join(dir, `${component}.json`), JSON.stringify(decision, null, 2) + '\n')
            appendFileSync(join(historyDir, 'log.jsonl'), JSON.stringify(decision) + '\n')
            console.log(`[variantkit] decision saved: .variantkit/decisions/${component}.json`)
            res.statusCode = 200
            res.setHeader('content-type', 'application/json')
            res.end('{"ok":true}')
          } catch (e) {
            res.statusCode = 400
            res.end(`bad decision payload: ${e.message}`)
          }
        })
      })
    },
  }
}
