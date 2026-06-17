'use client'
import { usePreview } from './shared'

const NAME = 'StatCard'
const FINALIZE = 'Finalize StatCard'
const CONFIG = {
  variant: { type: 'select', options: ['Soft', 'Solid', 'Outline'], default: 'Soft', segmented: true },
  accent: '#46d39a',
  radius: [16, 4, 26, 1],
  metric: 'Monthly revenue',
  value: [128, 1, 999, 1],
  trend: [12, -25, 60, 1],
  chart: true,
  finalize: { type: 'action', label: FINALIZE },
} as const

// A fixed, pleasant ramp; the last bar is the "current" one and reads as accent-bright.
const BARS = [42, 55, 38, 64, 50, 78, 62, 92]

export default function StatPreview() {
  const v = usePreview(NAME, CONFIG, FINALIZE)
  const variant = String(v.variant)
  const accent = String(v.accent)
  const radius = Number(v.radius)
  const metric = String(v.metric) || 'Metric'
  const value = Number(v.value)
  const trend = Number(v.trend)
  const chart = Boolean(v.chart)
  const up = trend >= 0

  const surface =
    variant === 'Solid'
      ? { background: `color-mix(in srgb, ${accent} 14%, #0e1014)`, border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)` }
      : variant === 'Outline'
      ? { background: 'transparent', border: '1px solid var(--line-2)' }
      : { background: '#101218', border: '1px solid var(--line)' }

  return (
    <div className="pv">
      <div className="pv-canvas">
        <div className="stat-card" style={{ ...surface, borderRadius: radius, ['--ac' as string]: accent }}>
          <div className="stat-top">
            <span className="stat-label">{metric}</span>
            <span className="stat-trend" data-up={up}>
              <span className="stat-tri">{up ? '▲' : '▼'}</span>{up ? '+' : ''}{trend}.4%
            </span>
          </div>
          <div className="stat-value"><span className="stat-cur">$</span>{value}<span className="stat-k">.4k</span></div>
          {chart && (
            <div className="stat-chart">
              {BARS.map((h, i) => (
                <span key={i} className="stat-bar" style={{ height: `${h}%`, opacity: i === BARS.length - 1 ? 1 : 0.35 + (i / BARS.length) * 0.3 }} />
              ))}
            </div>
          )}
          <div className="stat-foot">vs. last 8 weeks</div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  )
}

const css = `
.stat-card{width:340px;max-width:100%;padding:24px;display:flex;flex-direction:column;gap:14px;
  transition:background .28s cubic-bezier(.23,1,.32,1),border-color .28s cubic-bezier(.23,1,.32,1),border-radius .2s cubic-bezier(.23,1,.32,1)}
.stat-top{display:flex;align-items:center;justify-content:space-between}
.stat-label{font-size:13.5px;color:var(--dim);font-weight:500}
.stat-trend{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:560;font-variant-numeric:tabular-nums;
  border-radius:999px;padding:3px 9px;color:var(--ac);background:color-mix(in srgb,var(--ac) 16%,transparent)}
.stat-trend[data-up='false']{color:#f2667d;background:rgba(242,102,125,.14)}
.stat-tri{font-size:8px}
.stat-value{font-size:42px;font-weight:600;letter-spacing:-.035em;line-height:1;color:var(--ink);font-variant-numeric:tabular-nums;display:flex;align-items:baseline}
.stat-cur{font-size:22px;color:var(--dim);margin-right:1px}
.stat-k{font-size:20px;color:var(--faint);font-weight:500}
.stat-chart{display:flex;align-items:flex-end;gap:6px;height:64px;margin-top:2px}
.stat-bar{flex:1;background:var(--ac);border-radius:4px 4px 2px 2px;transition:height .3s cubic-bezier(.23,1,.32,1),opacity .3s,background .28s;min-height:6px}
.stat-foot{font-size:11.5px;color:var(--faint)}
`
