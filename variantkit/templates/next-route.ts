// VariantKit decision transport for Next.js (App Router) — dev-only. The panel's
// finalize button POSTs here; the decision lands in .variantkit/decisions/ and the
// agent applies it per AGENT.md §4. Installed by `variantkit init` at
// app/api/__variantkit/decision/route.ts. Returns 404 outside development.

import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'

const NAME_OK = /^[A-Za-z0-9_-]+$/

export async function POST(req: Request): Promise<Response> {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('not found', { status: 404 })
  }
  let decision: { component?: unknown }
  try {
    decision = await req.json()
  } catch {
    return new Response('bad decision payload', { status: 400 })
  }
  const component = String(decision.component ?? '')
  if (!NAME_OK.test(component)) {
    return new Response('invalid component name', { status: 400 })
  }
  const dir = join(process.cwd(), '.variantkit', 'decisions')
  const historyDir = join(process.cwd(), '.variantkit', 'history')
  mkdirSync(dir, { recursive: true })
  mkdirSync(historyDir, { recursive: true })
  writeFileSync(join(dir, `${component}.json`), JSON.stringify(decision, null, 2) + '\n')
  appendFileSync(join(historyDir, 'log.jsonl'), JSON.stringify(decision) + '\n')
  console.log(`[variantkit] decision saved: .variantkit/decisions/${component}.json`)
  return Response.json({ ok: true })
}
