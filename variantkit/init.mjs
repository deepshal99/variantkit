#!/usr/bin/env node
// variantkit — set up (or check, or fully remove) VariantKit in a project.
//
//   npx variantkit [init] [targetDir] [flags]   set everything up (default command)
//   npx variantkit doctor [targetDir]           check the install, print fix-its
//   npx variantkit remove [targetDir]           uninstall with zero residue
//
// init flags: --dry-run --skip-install --no-mount --no-skill --skill
// remove flags: --keep-deps --skill (also removes the global skill)
//
// init does (idempotent):
//   1. npm i dialkit motion
//   1b. ship the panel patch (delightful minimize/expand morph) via patch-package (non-fatal)
//   2. copy the runtime  -> <base>/variantkit/  (buildDecision, configs, schemas/, react/,
//      react.tsx Studio, panel css, vite-plugin)
//   3. copy AGENT.md     -> <target>/AGENT.md (won't clobber an existing one)
//   4. wire the decision transport (vite plugin / Next API route)
//   5. mount <DialRoot/> + <VariantBar/> + dialkit styles in the app entry
//   6. append the VariantKit pointer to CLAUDE.md / AGENTS.md / .cursor rules
//   7. gitignore .variantkit/ and install the global Claude Code skill
//
// Nothing is silent: every action is logged, every skip explains why.

import { execSync } from 'node:child_process'
import {
  existsSync, mkdirSync, copyFileSync, cpSync, readFileSync, writeFileSync,
  statSync, rmSync, rmdirSync,
} from 'node:fs'
import { dirname, join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const SELF = dirname(fileURLToPath(import.meta.url)) // the variantkit/ dir
const REPO_ROOT = resolve(SELF, '..')
const argv = process.argv.slice(2)
const COMMANDS = new Set(['init', 'doctor', 'remove'])
const command = COMMANDS.has(argv[0]) ? argv[0] : 'init'
const args = COMMANDS.has(argv[0]) ? argv.slice(1) : argv
const DRY = args.includes('--dry-run')
const SKIP_INSTALL = args.includes('--skip-install')
const NO_MOUNT = args.includes('--no-mount')
const NO_SKILL = args.includes('--no-skill')
const FORCE_SKILL = args.includes('--skill')
const KEEP_DEPS = args.includes('--keep-deps')
const target = resolve(args.find((a) => !a.startsWith('--')) ?? process.cwd())

const log = (m) => console.log(`  ${m}`)
const warn = (m) => console.warn(`  ! ${m}`)
const head = (m) => console.log(`\n${m}`)
const did = (m) => console.log(`  ${DRY ? '[dry] would' : '✓'} ${m}`)

function fail(m) {
  console.error(`\nvariantkit ${command} failed: ${m}`)
  process.exit(1)
}

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null }
}

// ---------------------------------------------------------------------------
// Project detection — shared by all commands
// ---------------------------------------------------------------------------

function detect() {
  const pkg = readJson(join(target, 'package.json')) ?? {}
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  const framework = deps.next ? 'next' : deps.vite ? 'vite' : deps['@remix-run/react'] ? 'remix' : 'unknown'
  const hasTs = existsSync(join(target, 'tsconfig.json'))
  const srcBase = existsSync(join(target, 'src')) ? join(target, 'src') : target
  const runtimeDir = join(srcBase, 'variantkit')

  // Next router dirs
  const appDir = ['app', join('src', 'app')].map((d) => join(target, d)).find(existsSync) ?? null
  const pagesDir = ['pages', join('src', 'pages')].map((d) => join(target, d)).find(existsSync) ?? null

  // Vite entry + config
  const entry = ['main.tsx', 'main.jsx', 'main.ts', 'main.js', 'index.tsx', 'index.jsx']
    .map((f) => join(srcBase, f)).find(existsSync) ?? null
  const viteConfig = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs', 'vite.config.mts']
    .map((f) => join(target, f)).find(existsSync) ?? null
  const layout = appDir
    ? ['layout.tsx', 'layout.jsx', 'layout.js'].map((f) => join(appDir, f)).find(existsSync) ?? null
    : null

  return { pkg, deps, framework, hasTs, srcBase, runtimeDir, appDir, pagesDir, entry, viteConfig, layout }
}

const POINTER = `
<!-- variantkit -->
## VariantKit
This project uses VariantKit for AI-assisted UI exploration. Read ./AGENT.md before building UI.
- When asked to build or change UI, offer 2-4 structural variants (a variant set) per AGENT.md,
  not one — wired to a FULL contextual panel (an archetype from variantkit/schemas, AGENT.md §7).
- On "paramify" / "let me tweak this", wrap the existing component in its archetype panel (§7).
- Generated variants must pass the deslop rules in AGENT.md (no random mono/italics/eyebrows,
  decorative lines/dots, unmotivated warm accents, oversized radii, em dashes, emoji).
- On "deslop" / "remove AI slop", run the deslop pass in AGENT.md.
- On "apply decision" (or at session start), apply pending .variantkit/decisions/*.json per AGENT.md §4.
- Before generating variants, read .variantkit/TASTE.md if present and bias defaults toward it.
<!-- /variantkit -->
`
const RULES_FILES = ['CLAUDE.md', 'AGENTS.md', join('.cursor', 'rules'), '.cursorrules']
const RUNTIME_FILES = [
  'buildDecision.ts', 'configs.ts', 'react.tsx',
  'dialkit-clean.css', 'dialkit-dark.css', 'motion.css',
  'vite-plugin.mjs', 'vite-plugin.d.mts',
]
const RUNTIME_DIRS = ['schemas', 'react']

// ---------------------------------------------------------------------------
// Codemods (init) — every patch is marker-guarded or pattern-guarded + reversible
// ---------------------------------------------------------------------------

function patchViteConfig(viteConfig, runtimeDir) {
  let src = readFileSync(viteConfig, 'utf8')
  if (src.includes('vite-plugin.mjs') || /variantkit\(\)/.test(src)) {
    log(`${relative(target, viteConfig)}: transport already wired, skipping`)
    return true
  }
  const importPath = './' + relative(target, join(runtimeDir, 'vite-plugin.mjs')).replace(/\\/g, '/')
  if (!/plugins:\s*\[/.test(src)) {
    warn(`${relative(target, viteConfig)}: no plugins array found — add manually:`)
    warn(`  import variantkit from '${importPath}'  +  plugins: [variantkit(), ...]`)
    return false
  }
  const importLine = `import variantkit from '${importPath}'\n`
  const lastImport = src.lastIndexOf('\nimport ')
  const insertAt = lastImport >= 0 ? src.indexOf('\n', lastImport + 1) + 1 : 0
  src = src.slice(0, insertAt) + importLine + src.slice(insertAt)
  src = src.replace(/plugins:\s*\[/, (m) => `${m}variantkit(), `)
  if (!DRY) writeFileSync(viteConfig, src)
  did(`wire vite transport -> ${relative(target, viteConfig)}`)
  return true
}

function mountChrome(file, runtimeDir, kind) {
  let src = readFileSync(file, 'utf8')
  if (src.includes('DialRoot')) {
    log(`${relative(target, file)}: DialRoot already mounted, skipping`)
    return true
  }
  const barPath = relative(dirname(file), join(runtimeDir, 'react', 'VariantBar')).replace(/\\/g, '/')
  const barImport = barPath.startsWith('.') ? barPath : './' + barPath
  const rtRel = relative(dirname(file), runtimeDir).replace(/\\/g, '/')
  const rt = rtRel.startsWith('.') ? rtRel : './' + rtRel
  const imports =
    `import { DialRoot } from 'dialkit'\nimport { VariantBar } from '${barImport}'\n` +
    `import 'dialkit/styles.css'\nimport '${rt}/dialkit-clean.css'\nimport '${rt}/motion.css'\n`
  const CHROME = '<DialRoot /><VariantBar />'

  let patched
  if (kind === 'next-layout') {
    // <body ...>{children}</body>  ->  mount as siblings of children
    patched = src.replace(/\{children\}(\s*<\/body>)/, `{children}${CHROME}$1`)
    if (patched === src) patched = src.replace(/\{children\}/, `<>{children}${CHROME}</>`)
  } else {
    // vite entry: <App /> -> fragment with chrome
    patched = src.replace(/<App\s*\/>/, `<><App />${CHROME}</>`)
  }
  if (patched === src) {
    warn(`${relative(target, file)}: could not find a mount point — add manually as siblings of your app:`)
    warn(`  ${CHROME} + import 'dialkit/styles.css'`)
    return false
  }
  const lastImport = patched.lastIndexOf('\nimport ')
  const insertAt = lastImport >= 0 ? patched.indexOf('\n', lastImport + 1) + 1 : 0
  patched = patched.slice(0, insertAt) + imports + patched.slice(insertAt)
  if (!DRY) writeFileSync(file, patched)
  did(`mount <DialRoot/> + <VariantBar/> -> ${relative(target, file)}`)
  return true
}

function appendGitignore() {
  const p = join(target, '.gitignore')
  const cur = existsSync(p) ? readFileSync(p, 'utf8') : ''
  if (cur.split('\n').some((l) => l.trim() === '.variantkit/')) {
    log('.gitignore: already ignores .variantkit/, skipping')
    return
  }
  if (!DRY) writeFileSync(p, cur.replace(/\s*$/, '\n') + '.variantkit/\n')
  did('gitignore .variantkit/')
}

function installSkill() {
  const skillSrc = join(SELF, 'skill')
  const skillDest = join(homedir(), '.claude', 'skills', 'variantkit')
  if (!existsSync(skillSrc)) return warn('skill source missing, skipping')
  if (DRY) return did(`copy skill -> ${skillDest}`)
  mkdirSync(dirname(skillDest), { recursive: true })
  cpSync(skillSrc, skillDest, { recursive: true })
  did(`installed global skill -> ${skillDest}`)
}

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------

function init() {
  head(`variantkit init → ${target}${DRY ? '  (dry run)' : ''}`)
  if (!existsSync(target) || !statSync(target).isDirectory()) fail(`not a directory: ${target}`)
  if (!existsSync(join(target, 'package.json'))) {
    warn('no package.json in target — is this a JS/TS project? continuing anyway.')
  }
  const d = detect()
  log(`detected: framework=${d.framework} ts=${d.hasTs} base=${relative(target, d.srcBase) || '.'}`)
  if (!d.hasTs) {
    warn('no tsconfig.json — the runtime ships as TypeScript; Vite and Next compile it as-is,')
    warn('but add a tsconfig for editor types if you can.')
  }

  // 1. deps
  head('1. dependencies (dialkit, motion)')
  if (SKIP_INSTALL) log('skipped (--skip-install)')
  else if (DRY) did('run: npm i dialkit motion')
  else {
    try {
      execSync('npm i dialkit motion', { cwd: target, stdio: 'inherit' })
      did('installed dialkit + motion')
    } catch (e) {
      fail(`npm install failed: ${e.message}`)
    }
  }

  // 1b. panel polish — ship the delightful minimize/expand morph as a patch over dialkit's
  // dist (the one thing CSS can't reach: a hardcoded motion spring). patch-package + a
  // postinstall hook keep it applied across reinstalls. Pinned to dialkit 1.2.0; entirely
  // non-fatal — if anything here fails the panel still works, just with the default morph.
  head('1b. panel polish (delightful minimize/expand morph)')
  const patchSrc = join(SELF, 'patches', 'dialkit+1.2.0.patch')
  if (!existsSync(patchSrc)) {
    warn('panel patch missing — skipping (panel works, just the default morph)')
  } else {
    const patchDest = join(target, 'patches', 'dialkit+1.2.0.patch')
    if (!DRY) {
      mkdirSync(dirname(patchDest), { recursive: true })
      copyFileSync(patchSrc, patchDest)
    }
    did(`copy dialkit patch -> ${relative(target, patchDest)}`)
    if (SKIP_INSTALL) {
      log('skipped applying (--skip-install) — run `npx patch-package` to apply the morph')
    } else if (DRY) {
      did('run: add "postinstall":"patch-package", npm i -D patch-package, npx patch-package')
    } else {
      try {
        const pkgPath = join(target, 'package.json')
        if (existsSync(pkgPath)) {
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
          pkg.scripts = pkg.scripts || {}
          const cur = pkg.scripts.postinstall
          if (!cur) {
            pkg.scripts.postinstall = 'patch-package'
            writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
            did('add "postinstall": "patch-package" to package.json')
          } else if (cur.includes('patch-package')) {
            log('postinstall already runs patch-package — left as is')
          } else {
            // Don't clobber an existing postinstall — run theirs first, then patch-package.
            pkg.scripts.postinstall = `${cur} && patch-package`
            writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
            warn(`appended patch-package to your existing postinstall (now: "${pkg.scripts.postinstall}") — review it`)
          }
        }
        execSync('npm i -D patch-package', { cwd: target, stdio: 'inherit' })
        execSync('npx patch-package', { cwd: target, stdio: 'inherit' })
        did('applied delightful minimize/expand morph to dialkit')
      } catch (e) {
        warn(`could not apply panel patch (non-fatal): ${e.message}`)
      }
    }
  }

  // 2. runtime
  head('2. runtime (buildDecision, schemas/, react/, vite-plugin)')
  if (!DRY) mkdirSync(d.runtimeDir, { recursive: true })
  for (const f of RUNTIME_FILES) {
    const src = join(SELF, f)
    if (!existsSync(src)) fail(`missing source: ${src}`)
    if (!DRY) copyFileSync(src, join(d.runtimeDir, f))
  }
  for (const dir of RUNTIME_DIRS) {
    const src = join(SELF, dir)
    if (!existsSync(src)) fail(`missing source: ${src}`)
    if (!DRY) cpSync(src, join(d.runtimeDir, dir), { recursive: true })
  }
  did(`copy runtime -> ${relative(target, d.runtimeDir)}/`)

  // 3. AGENT.md
  head('3. contract (AGENT.md)')
  const agentSrc = join(REPO_ROOT, 'AGENT.md')
  if (!existsSync(agentSrc)) fail(`missing source: ${agentSrc}`)
  let agentDest = join(target, 'AGENT.md')
  if (existsSync(agentDest) && !readFileSync(agentDest, 'utf8').includes('VariantKit — Agent Contract')) {
    agentDest = join(target, 'AGENT.variantkit.md')
    warn('AGENT.md already exists — writing AGENT.variantkit.md instead (merge by hand)')
  }
  if (!DRY) copyFileSync(agentSrc, agentDest)
  did(`copy AGENT.md -> ${relative(target, agentDest)}`)
  const namingSrc = join(REPO_ROOT, 'NAMING.md')
  const namingDest = join(target, 'NAMING.md')
  if (!existsSync(namingSrc)) {
    warn('NAMING.md source missing — skipping (AGENT.md references it)')
  } else if (existsSync(namingDest) && !readFileSync(namingDest, 'utf8').includes('VariantKit — Vocabulary')) {
    warn('NAMING.md already exists and is not ours — left untouched')
  } else {
    if (!DRY) copyFileSync(namingSrc, namingDest)
    did(`copy NAMING.md -> ${relative(target, namingDest)}`)
  }

  // 4. decision transport
  head('4. decision transport')
  if (d.framework === 'vite' && d.viteConfig) {
    patchViteConfig(d.viteConfig, d.runtimeDir)
  } else if (d.framework === 'next' && d.appDir) {
    const routeDest = join(d.appDir, 'api', '__variantkit', 'decision', 'route.ts')
    if (existsSync(routeDest)) log('Next route already present, skipping')
    else {
      if (!DRY) mkdirSync(dirname(routeDest), { recursive: true })
      if (!DRY) copyFileSync(join(SELF, 'templates', 'next-route.ts'), routeDest)
      did(`copy Next App Router route -> ${relative(target, routeDest)}`)
    }
  } else if (d.framework === 'next' && d.pagesDir) {
    const routeDest = join(d.pagesDir, 'api', '__variantkit', 'decision.ts')
    if (existsSync(routeDest)) log('Next pages API route already present, skipping')
    else {
      if (!DRY) mkdirSync(dirname(routeDest), { recursive: true })
      if (!DRY) copyFileSync(join(SELF, 'templates', 'next-pages-api.ts'), routeDest)
      did(`copy Next Pages Router route -> ${relative(target, routeDest)}`)
    }
  } else {
    warn(`framework=${d.framework}: no transport wired — finalize falls back to the clipboard.`)
    warn('(vite + Next are supported; see variantkit/vite-plugin.mjs to wire others)')
  }

  // 5. mount chrome
  head('5. app chrome (<DialRoot/> + <VariantBar/>)')
  if (NO_MOUNT) log('skipped (--no-mount)')
  else if (d.framework === 'next' && d.layout) mountChrome(d.layout, d.runtimeDir, 'next-layout')
  else if (d.entry) mountChrome(d.entry, d.runtimeDir, 'vite-entry')
  else {
    warn('no entry/layout found — mount manually as siblings of your app root:')
    warn("  <DialRoot /> <VariantBar /> + import 'dialkit/styles.css'")
  }

  // 6. rules pointer
  head('6. agent rules pointer')
  let patched = 0
  for (const rel of RULES_FILES) {
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

  // 7. housekeeping
  head('7. housekeeping')
  appendGitignore()
  const wantSkill = FORCE_SKILL || (!NO_SKILL && existsSync(join(homedir(), '.claude')))
  if (wantSkill) installSkill()
  else log(`global skill skipped (${NO_SKILL ? '--no-skill' : 'no ~/.claude found'}; force with --skill)`)

  head('done. next:')
  log('run your dev server, then ask your AI for "three takes on <component>".')
  log('switch with the bottom bar (keys 1..9), Compare for side-by-side, Finalize when happy —')
  log('then tell your agent "apply decision". Check the install anytime: npx variantkit doctor')
}

// ---------------------------------------------------------------------------
// doctor
// ---------------------------------------------------------------------------

function doctor() {
  head(`variantkit doctor → ${target}`)
  const d = detect()
  let fails = 0
  const check = (ok, label, fix) => {
    console.log(`  ${ok ? '✓' : '✗'} ${label}${ok ? '' : ` — ${fix}`}`)
    if (!ok) fails++
  }

  check(!!d.deps.dialkit, 'dialkit dependency', 'npm i dialkit')
  check(!!d.deps.motion, 'motion dependency', 'npm i motion')
  check(existsSync(join(d.runtimeDir, 'buildDecision.ts')), 'runtime: buildDecision.ts', 'npx variantkit init')
  check(existsSync(join(d.runtimeDir, 'schemas', 'archetypes.ts')), 'runtime: schemas/', 'npx variantkit init')
  check(existsSync(join(d.runtimeDir, 'react', 'VariantBar.tsx')), 'runtime: react/', 'npx variantkit init')
  check(existsSync(join(d.runtimeDir, 'configs.ts')), 'runtime: configs.ts', 'npx variantkit init')
  check(existsSync(join(d.runtimeDir, 'react.tsx')), 'runtime: react.tsx (Studio)', 'npx variantkit init')
  check(existsSync(join(d.runtimeDir, 'dialkit-clean.css')), 'runtime: panel css', 'npx variantkit init')
  const agentOk = [join(target, 'AGENT.md'), join(target, 'AGENT.variantkit.md')]
    .some((p) => existsSync(p) && readFileSync(p, 'utf8').includes('VariantKit — Agent Contract'))
  check(agentOk, 'AGENT.md contract', 'npx variantkit init')

  const mountFile = (d.framework === 'next' ? d.layout : d.entry)
  const mounted = mountFile && readFileSync(mountFile, 'utf8').includes('DialRoot')
  check(!!mounted, '<DialRoot/> + <VariantBar/> mounted', `mount in ${mountFile ? relative(target, mountFile) : 'your app entry'}`)
  const styles = mountFile && readFileSync(mountFile, 'utf8').includes('dialkit/styles.css')
  check(!!styles, 'dialkit styles imported', "import 'dialkit/styles.css' next to the mount")

  if (d.framework === 'vite') {
    const wired = d.viteConfig && readFileSync(d.viteConfig, 'utf8').includes('variantkit')
    check(!!wired, 'vite decision transport', 'add variantkit() plugin to vite.config')
  } else if (d.framework === 'next') {
    const route = (d.appDir && existsSync(join(d.appDir, 'api', '__variantkit', 'decision', 'route.ts')))
      || (d.pagesDir && existsSync(join(d.pagesDir, 'api', '__variantkit', 'decision.ts')))
    check(!!route, 'Next decision transport route', 'npx variantkit init')
  } else {
    log(`~ framework=${d.framework}: transport check skipped (clipboard fallback applies)`)
  }

  const pointer = RULES_FILES.some((rel) => {
    const p = join(target, rel)
    return existsSync(p) && readFileSync(p, 'utf8').includes('<!-- variantkit -->')
  })
  check(pointer, 'agent rules pointer', 'npx variantkit init')
  const gi = join(target, '.gitignore')
  check(existsSync(gi) && readFileSync(gi, 'utf8').includes('.variantkit/'), '.variantkit/ gitignored', 'add .variantkit/ to .gitignore')
  const skill = existsSync(join(homedir(), '.claude', 'skills', 'variantkit', 'SKILL.md'))
  check(skill, 'global Claude Code skill', 'npx variantkit init --skill')

  head(fails === 0 ? 'all good.' : `${fails} issue${fails > 1 ? 's' : ''} found.`)
  process.exit(fails === 0 ? 0 : 1)
}

// ---------------------------------------------------------------------------
// remove — zero residue, the prune ethos applied to the tool itself
// ---------------------------------------------------------------------------

function remove() {
  head(`variantkit remove → ${target}${DRY ? '  (dry run)' : ''}`)
  const d = detect()

  // runtime + state
  for (const p of [d.runtimeDir, join(target, '.variantkit')]) {
    if (!existsSync(p)) continue
    if (!DRY) rmSync(p, { recursive: true, force: true })
    did(`delete ${relative(target, p)}/`)
  }

  // AGENT.md + NAMING.md (only the ones we wrote)
  for (const name of ['AGENT.md', 'AGENT.variantkit.md', 'NAMING.md']) {
    const p = join(target, name)
    const marker = name === 'NAMING.md' ? 'VariantKit — Vocabulary' : 'VariantKit — Agent Contract'
    if (existsSync(p) && readFileSync(p, 'utf8').includes(marker)) {
      if (!DRY) rmSync(p)
      did(`delete ${name}`)
    }
  }

  // pointer blocks
  for (const rel of RULES_FILES) {
    const p = join(target, rel)
    if (!existsSync(p)) continue
    const cur = readFileSync(p, 'utf8')
    if (!cur.includes('<!-- variantkit -->')) continue
    const next = cur
      .replace(/\n*<!-- variantkit -->[\s\S]*?<!-- \/variantkit -->\n?/g, '')
      .replace(/\s*$/, '\n')
    if (!DRY) {
      if (next.trim() === '# Project') rmSync(p) // we created this file ourselves
      else writeFileSync(p, next)
    }
    did(`strip pointer from ${rel}`)
  }

  // vite config
  if (d.viteConfig) {
    const cur = readFileSync(d.viteConfig, 'utf8')
    if (cur.includes('variantkit')) {
      const next = cur
        .replace(/import variantkit from '[^']*vite-plugin\.mjs'\n?/, '')
        .replace(/variantkit\(\),\s*/, '')
        .replace(/,?\s*variantkit\(\)/, '')
      if (!DRY) writeFileSync(d.viteConfig, next)
      did(`unwire transport from ${relative(target, d.viteConfig)}`)
    }
  }

  // Next routes
  for (const p of [
    d.appDir && join(d.appDir, 'api', '__variantkit'),
    d.pagesDir && join(d.pagesDir, 'api', '__variantkit'),
  ].filter(Boolean)) {
    if (!existsSync(p)) continue
    if (!DRY) rmSync(p, { recursive: true, force: true })
    did(`delete ${relative(target, p)}/`)
  }

  // unmount chrome
  for (const file of [d.entry, d.layout].filter(Boolean)) {
    const cur = readFileSync(file, 'utf8')
    if (!cur.includes('DialRoot')) continue
    const next = cur
      .replace(/import \{ DialRoot \} from 'dialkit'\n?/, '')
      .replace(/import \{ VariantBar \} from '[^']*'\n?/, '')
      .replace(/import 'dialkit\/styles\.css'\n?/, '')
      .replace(/import '[^']*dialkit-clean\.css'\n?/, '')
      .replace(/import '[^']*motion\.css'\n?/, '')
      .replace(/<><App \/><DialRoot \/><VariantBar \/><\/>/, '<App />')
      .replace(/\{children\}<DialRoot \/><VariantBar \/>/, '{children}')
      .replace(/<>\{children\}<DialRoot \/><VariantBar \/><\/>/, '{children}')
      .replace(/<DialRoot \/>\s*<VariantBar \/>\s*/, '')
    if (!DRY) writeFileSync(file, next)
    did(`unmount chrome from ${relative(target, file)}`)
  }

  // .gitignore line
  const gi = join(target, '.gitignore')
  if (existsSync(gi)) {
    const cur = readFileSync(gi, 'utf8')
    if (cur.includes('.variantkit/')) {
      if (!DRY) writeFileSync(gi, cur.split('\n').filter((l) => l.trim() !== '.variantkit/').join('\n'))
      did('remove .variantkit/ from .gitignore')
    }
  }

  // panel patch + postinstall hook
  const patchFile = join(target, 'patches', 'dialkit+1.2.0.patch')
  if (existsSync(patchFile)) {
    if (!DRY) {
      rmSync(patchFile)
      try { rmdirSync(join(target, 'patches')) } catch { /* not empty — leave it */ }
    }
    did('delete patches/dialkit+1.2.0.patch')
  }
  const pkgPath = join(target, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    const cur = pkg.scripts?.postinstall
    if (cur === 'patch-package') {
      if (!DRY) {
        delete pkg.scripts.postinstall
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
      }
      did('remove "postinstall": "patch-package"')
    } else if (cur?.includes(' && patch-package')) {
      if (!DRY) {
        pkg.scripts.postinstall = cur.replace(' && patch-package', '')
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
      }
      did('strip patch-package from postinstall')
    }
  }

  // deps
  if (KEEP_DEPS) log('keeping dialkit + motion (--keep-deps)')
  else if (DRY) did('run: npm uninstall dialkit motion patch-package')
  else if (d.deps.dialkit || d.deps.motion) {
    try {
      execSync('npm uninstall dialkit motion patch-package', { cwd: target, stdio: 'inherit' })
      did('uninstalled dialkit + motion + patch-package')
    } catch (e) {
      warn(`npm uninstall failed: ${e.message}`)
    }
  }

  // global skill — only on explicit request (it serves other projects too)
  if (FORCE_SKILL) {
    const skillDest = join(homedir(), '.claude', 'skills', 'variantkit')
    if (existsSync(skillDest)) {
      if (!DRY) rmSync(skillDest, { recursive: true, force: true })
      did(`delete global skill ${skillDest}`)
    }
  } else {
    log('global skill kept (remove with: npx variantkit remove --skill)')
  }

  head('removed. `git status` should show only deletions and reverted lines.')
}

// ---------------------------------------------------------------------------

if (command === 'doctor') doctor()
else if (command === 'remove') remove()
else init()

