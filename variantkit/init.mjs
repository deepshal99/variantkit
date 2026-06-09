#!/usr/bin/env node
// variantkit init — set up VariantKit in a project so your AI knows to offer UI variants.
//
//   node /path/to/variantkit/init.mjs [targetDir] [--dry-run] [--skip-install]
//
// Does four things (idempotent):
//   1. npm i dialkit motion          (the runtime; skip with --skip-install)
//   2. copy buildDecision.ts         -> <target>/src/variantkit/ (or <target>/variantkit/)
//   3. copy AGENT.md                 -> <target>/AGENT.md (won't clobber an existing one)
//   4. append a VariantKit pointer   -> CLAUDE.md / AGENTS.md / .cursor/rules / .cursorrules
//
// Nothing is silent: every action is logged, every skip explains why.

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, copyFileSync, cpSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const SELF = dirname(fileURLToPath(import.meta.url)) // the variantkit/ dir
const REPO_ROOT = resolve(SELF, '..')
const argv = process.argv.slice(2)
const DRY = argv.includes('--dry-run')
const SKIP_INSTALL = argv.includes('--skip-install')
const WITH_SKILL = argv.includes('--skill')
const target = resolve(argv.find((a) => !a.startsWith('--')) ?? process.cwd())

const log = (m) => console.log(`  ${m}`)
const warn = (m) => console.warn(`  ! ${m}`)
const head = (m) => console.log(`\n${m}`)
const did = (m) => console.log(`  ${DRY ? '[dry] would' : '✓'} ${m}`)

function fail(m) {
  console.error(`\nvariantkit init failed: ${m}`)
  process.exit(1)
}

head(`variantkit init → ${target}${DRY ? '  (dry run)' : ''}`)

if (!existsSync(target) || !statSync(target).isDirectory()) fail(`not a directory: ${target}`)
if (!existsSync(join(target, 'package.json'))) {
  warn(`no package.json in target — is this a JS/TS project? continuing anyway.`)
}

// 1. deps
head('1. dependencies (dialkit, motion)')
if (SKIP_INSTALL) {
  log('skipped (--skip-install)')
} else if (DRY) {
  did('run: npm i dialkit motion')
} else {
  try {
    execSync('npm i dialkit motion', { cwd: target, stdio: 'inherit' })
    did('installed dialkit + motion')
  } catch (e) {
    fail(`npm install failed: ${e.message}`)
  }
}

// 2. buildDecision.ts
head('2. runtime (buildDecision.ts)')
const srcDir = existsSync(join(target, 'src')) ? join(target, 'src', 'variantkit') : join(target, 'variantkit')
const buildDest = join(srcDir, 'buildDecision.ts')
const buildSrc = join(SELF, 'buildDecision.ts')
if (!existsSync(buildSrc)) fail(`missing source: ${buildSrc}`)
if (!DRY) mkdirSync(srcDir, { recursive: true })
if (!DRY) copyFileSync(buildSrc, buildDest)
did(`copy buildDecision.ts -> ${relative(target, buildDest)}`)

// 3. AGENT.md (do not clobber an existing project AGENT.md)
head('3. contract (AGENT.md)')
const agentSrc = join(REPO_ROOT, 'AGENT.md')
if (!existsSync(agentSrc)) fail(`missing source: ${agentSrc}`)
let agentDest = join(target, 'AGENT.md')
if (existsSync(agentDest)) {
  agentDest = join(target, 'AGENT.variantkit.md')
  warn(`AGENT.md already exists — writing AGENT.variantkit.md instead (merge by hand)`)
}
if (!DRY) copyFileSync(agentSrc, agentDest)
did(`copy AGENT.md -> ${relative(target, agentDest)}`)

// 4. rules pointer
head('4. agent rules pointer')
const POINTER = `
<!-- variantkit -->
## VariantKit
This project uses VariantKit for AI-assisted UI exploration. Read ./AGENT.md before building UI.
- When asked to build or change UI, offer 2-4 structural variants (a variant set) per AGENT.md, not one.
- Generated variants must pass the deslop rules in AGENT.md (no random mono/italics/eyebrows,
  decorative lines/dots, unmotivated warm accents, oversized radii, em dashes, emoji).
- On "deslop" / "remove AI slop", run the deslop pass in AGENT.md.
- On a finalized decision.json, prune the variant set per AGENT.md.
<!-- /variantkit -->
`
const RULES = ['CLAUDE.md', 'AGENTS.md', join('.cursor', 'rules'), '.cursorrules']
let patched = 0
for (const rel of RULES) {
  const p = join(target, rel)
  if (!existsSync(p)) continue
  const cur = readFileSync(p, 'utf8')
  if (cur.includes('<!-- variantkit -->')) {
    log(`${rel}: already has the pointer, skipping`)
    patched++
    continue
  }
  if (!DRY) writeFileSync(p, cur.replace(/\s*$/, '') + '\n' + POINTER)
  did(`append pointer -> ${rel}`)
  patched++
}
if (patched === 0) {
  const p = join(target, 'CLAUDE.md')
  if (!DRY) writeFileSync(p, `# Project\n${POINTER}`)
  did('no rules file found — created CLAUDE.md with the pointer')
}

// 5. optional global Claude Code skill (so the AI offers variants in EVERY project)
if (WITH_SKILL) {
  head('5. global Claude Code skill (--skill)')
  const skillSrc = join(SELF, 'skill')
  const skillDest = join(homedir(), '.claude', 'skills', 'variantkit')
  if (!existsSync(skillSrc)) {
    warn('skill source missing, skipping')
  } else if (DRY) {
    did(`copy skill -> ${skillDest}`)
  } else {
    mkdirSync(dirname(skillDest), { recursive: true })
    cpSync(skillSrc, skillDest, { recursive: true })
    did(`installed global skill -> ${skillDest}`)
  }
}

// done
const importPath = relative(join(target, 'src'), buildDest).replace(/\.ts$/, '') || './variantkit/buildDecision'
head('done. next:')
log(`add <DialRoot/> as a sibling of your app root and import 'dialkit/styles.css'`)
log(`in a component, useDialKit with a 'variant' select + a 'finalize' action,`)
log(`and call buildDecision/copyDecision from '${importPath.startsWith('.') ? importPath : './' + importPath}'`)
log(`then ask your AI for "three takes on <component>" — it will scaffold a variant set.`)
