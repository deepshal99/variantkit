import Link from 'next/link'

export const metadata = { title: 'Docs · VariantKit' }

const NAV = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'install', label: 'Install' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'using-it', label: 'Using it with your agent' },
  { id: 'finalize', label: 'Finalize & prune' },
  { id: 'requirements', label: 'Requirements' },
]

export default function Docs() {
  return (
    <div className="docs">
      <header className="d-top">
        <Link className="brand" href="/"><span className="mark"><i /><i /><i /></span>VariantKit</Link>
        <nav className="nav">
          <Link href="/docs" className="active">Docs</Link>
          <a className="ic" href="https://github.com/deepshal99/variantkit" target="_blank" rel="noopener" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.2 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.6-4.04-1.6-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.66-5.49 5.96.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.57C20.56 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5z"/></svg>
          </a>
        </nav>
      </header>

      <div className="d-body">
        <aside className="d-side">
          <span className="d-side-label">Documentation</span>
          <nav>
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`}>{n.label}</a>)}
          </nav>
        </aside>

        <main className="d-main">
          <article className="prose">
            <span className="kicker">Documentation</span>
            <h1>VariantKit</h1>
            <p className="lead">The control panel for AI-built UI. When your agent builds a component, VariantKit has it generate a few real variants wired to a live panel, so you compare, tune, and keep one instead of accepting its first guess.</p>

            <h2 id="introduction">Introduction</h2>
            <p>An AI agent normally commits to a single interpretation of any UI you ask for. VariantKit changes that: the agent scaffolds <strong>2–4 structural variants</strong> of the element and mounts a contextual control panel beside it. You switch between takes, adjust every design axis live, and <strong>finalize</strong> the one you want. The losing variants are then pruned from the codebase, leaving one clean component.</p>

            <h2 id="install">Install</h2>
            <p>Run this once from your project root:</p>
            <pre><code><span className="pr">$</span> npx variantkit@latest</code></pre>
            <p>It adds the runtime, mounts the panel host, wires the decision transport, and drops a rules file so your agent knows to reach for it. Check or undo anytime with <code>npx variantkit@latest doctor</code> and <code>npx variantkit@latest remove</code>.</p>

            <h2 id="how-it-works">How it works</h2>
            <ol className="steps">
              <li><span className="n">01</span><div><b>Generate</b><p>Your agent builds 2 to 4 real variants of the element, as separate, self-contained components.</p></div></li>
              <li><span className="n">02</span><div><b>Tune</b><p>Switch between takes and adjust every control, like color, radius, spacing, and type, in real time.</p></div></li>
              <li><span className="n">03</span><div><b>Finalize → prune</b><p>Pick the winner. VariantKit writes a decision; your agent inlines it and deletes the rest.</p></div></li>
            </ol>

            <h2 id="using-it">Using it with your agent</h2>
            <p>There’s nothing new to learn. Just ask your agent to build or change any UI, like a button, a card, a hero, or a section. With VariantKit installed it scaffolds variants and mounts the panel automatically. Tweak what you like, click <strong>Finalize</strong>, then tell your agent <em>“apply decision”</em> and it prunes down to your pick.</p>

            <h2 id="finalize">Finalize &amp; prune</h2>
            <p>Finalize writes a small <code>decision.json</code> with the chosen variant and your override values. The agent inlines those values into the winner, renames it to the component’s real file, and deletes the other variants and the wiring. No graveyard of commented-out alternatives, no leftover scaffolding.</p>

            <h2 id="requirements">Requirements</h2>
            <ul className="ticks">
              <li>A React project (Vite, Next.js, or similar).</li>
              <li>A running dev server. The panel is dev-time only and never ships to production.</li>
              <li>An AI coding agent (Claude Code, Cursor, or any agent that reads your project rules).</li>
            </ul>

            <div className="d-foot">
              <Link href="/">← Back to home</Link>
              <a href="https://github.com/deepshal99/variantkit" target="_blank" rel="noopener">GitHub ↗</a>
            </div>
          </article>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  )
}

const css = `
.docs{min-height:100dvh;background:var(--bg)}
.d-top{position:sticky;top:0;z-index:10;height:56px;display:flex;align-items:center;justify-content:space-between;
  padding:0 clamp(20px,4vw,40px);border-bottom:1px solid var(--line);background:rgba(8,9,10,.8);backdrop-filter:blur(10px)}
.d-top .brand{display:flex;align-items:center;gap:10px;font-weight:560;font-size:15px;letter-spacing:-.01em}
.d-top .mark{display:inline-flex;gap:2.5px}
.d-top .mark i{width:5px;height:15px;border-radius:2px;background:var(--ink);opacity:.85;display:block}
.d-top .mark i:nth-child(2){opacity:.55;height:18px}.d-top .mark i:nth-child(3){opacity:.3}
.d-top .nav{display:flex;align-items:center;gap:6px}
.d-top .nav a{font-size:14px;color:var(--dim);padding:7px 11px;border-radius:8px;transition:.18s;display:inline-flex;align-items:center}
.d-top .nav a:hover{color:var(--ink);background:var(--chip)}
.d-top .nav a.active{color:var(--ink)}
.d-top .nav a.ic{padding:8px}.d-top svg{display:block}

.d-body{display:grid;grid-template-columns:240px minmax(0,1fr);max-width:1100px;margin:0 auto;gap:48px;
  padding:0 clamp(20px,4vw,40px)}
.d-side{position:sticky;top:56px;align-self:start;height:max-content;padding-top:48px}
.d-side-label{display:block;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin-bottom:14px;padding-left:12px}
.d-side nav{display:flex;flex-direction:column;gap:2px}
.d-side nav a{font-size:14px;color:var(--dim);padding:7px 12px;border-radius:7px;transition:.15s}
.d-side nav a:hover{color:var(--ink);background:var(--chip)}

.d-main{padding:48px 0 100px;min-width:0}
.prose{max-width:680px}
.kicker{display:block;font-size:12.5px;font-weight:500;color:var(--dim);margin-bottom:10px}
.prose h1{font-size:40px;font-weight:600;letter-spacing:-.03em;margin:0 0 18px;line-height:1.05}
.prose .lead{font-size:18px;line-height:1.6;color:var(--dim);margin:0 0 16px;font-weight:450}
.prose h2{font-size:20px;font-weight:560;letter-spacing:-.02em;margin:44px 0 14px;scroll-margin-top:80px}
.prose p{font-size:15.5px;line-height:1.68;color:#c3c7cc;margin:0 0 14px;font-weight:430}
.prose strong{color:var(--ink);font-weight:560}
.prose em{color:var(--ink);font-style:normal;border-bottom:1px solid var(--line-2)}
.prose code{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:13px;background:var(--chip);border:1px solid var(--line);border-radius:6px;padding:2px 6px;color:var(--ink)}
.prose pre{background:#0c0d10;border:1px solid var(--line-2);border-radius:12px;padding:16px 18px;margin:0 0 16px;overflow:auto}
.prose pre code{background:none;border:0;padding:0;font-size:13.5px;color:var(--ink)}
.prose pre .pr{color:var(--faint);margin-right:9px}
.steps{list-style:none;margin:0 0 16px;padding:0;display:flex;flex-direction:column;gap:18px}
.steps li{display:flex;gap:18px;align-items:baseline}
.steps .n{font-size:13px;font-weight:600;color:var(--dim);font-variant-numeric:tabular-nums;flex:0 0 auto;width:24px}
.steps b{display:block;font-size:15px;font-weight:560;color:var(--ink);margin-bottom:3px}
.steps p{margin:0;font-size:14.5px;color:var(--dim);line-height:1.55}
.ticks{margin:0 0 16px;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.ticks li{position:relative;padding-left:24px;font-size:15px;color:#c3c7cc;line-height:1.55}
.ticks li::before{content:"";position:absolute;left:2px;top:8px;width:6px;height:6px;border-radius:50%;background:var(--dim)}
.d-foot{display:flex;justify-content:space-between;margin-top:56px;padding-top:24px;border-top:1px solid var(--line);font-size:14px;color:var(--dim)}
.d-foot a:hover{color:var(--ink)}

@media (max-width:820px){
  .d-body{grid-template-columns:1fr;gap:0}
  .d-side{display:none}
  .prose h1{font-size:32px}
}
`
