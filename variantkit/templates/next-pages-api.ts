// VariantKit decision transport for Next.js (Pages Router) — dev-only. Installed by
// `variantkit init` at pages/api/__variantkit/decision.ts. Returns 404 outside development.

import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NextApiRequest, NextApiResponse } from 'next'

const NAME_OK = /^[A-Za-z0-9_-]+$/

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).end('not found')
    return
  }
  if (req.method !== 'POST') {
    res.status(405).end('method not allowed')
    return
  }
  const decision = req.body
  const component = String(decision?.component ?? '')
  if (!NAME_OK.test(component)) {
    res.status(400).end('invalid component name')
    return
  }
  const dir = join(process.cwd(), '.variantkit', 'decisions')
  const historyDir = join(process.cwd(), '.variantkit', 'history')
  mkdirSync(dir, { recursive: true })
  mkdirSync(historyDir, { recursive: true })
  writeFileSync(join(dir, `${component}.json`), JSON.stringify(decision, null, 2) + '\n')
  appendFileSync(join(historyDir, 'log.jsonl'), JSON.stringify(decision) + '\n')
  console.log(`[variantkit] decision saved: .variantkit/decisions/${component}.json`)
  res.status(200).json({ ok: true })
}
