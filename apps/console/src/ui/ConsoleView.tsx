import React, { useEffect, useMemo, useState } from 'react'
import { JsonView, darkStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import type { Api, ReceiptVerifyRequest } from '../api'

const colors = {
  bg: '#0b1321',
  panel: '#121b2e',
  text: '#e6edf6',
  accent: '#57a6ff',
}

type State = { why: any, gl: any[], bank: any[], matches: any[] }

export function ConsoleView({ api }: { api: Api }) {
  const [state, setState] = useState<State>({ why: {}, gl: [], bank: [], matches: [] })
  const [verifyForm, setVerifyForm] = useState<ReceiptVerifyRequest>({ payload_hash_b64: '', signature_b64: '', public_key_b64: '' })
  const [verifyResult, setVerifyResult] = useState<string>('')
  const [kpi, setKpi] = useState<any>(null)
  const [controls, setControls] = useState<any[]>([])
  const [flux, setFlux] = useState<any[]>([])
  const [forecast, setForecast] = useState<any[]>([])
  const [exceptions, setExceptions] = useState<any[]>([])
  const [spend, setSpend] = useState<any[]>([])
  const [kpiSpend, setKpiSpend] = useState<any>(null)
  const [kpiTreasury, setKpiTreasury] = useState<any>(null)
  const [packIds, setPackIds] = useState<string>("")
  const [policies, setPolicies] = useState<any[]>([])
  const [verifyId, setVerifyId] = useState<string>("")
  const [cashSeries, setCashSeries] = useState<any[]>([])
  const [controlsKeyFilter, setControlsKeyFilter] = useState<string>("")
  const [exceptionStatusFilter, setExceptionStatusFilter] = useState<string>("")
  const [limit, setLimit] = useState<number>(100)
  const [offset, setOffset] = useState<number>(0)
  const [proposeMode, setProposeMode] = useState<boolean>(false)
  const [kpiAudit, setKpiAudit] = useState<any>(null)
  const [kpiDQ, setKpiDQ] = useState<any>(null)
  const [features, setFeatures] = useState<Record<string, any> | null>(null)
  const [jobRuns, setJobRuns] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>('GL')
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [drawerId, setDrawerId] = useState<string>("")
  const [drawerJson, setDrawerJson] = useState<any>(null)
  const [showWhyJson, setShowWhyJson] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sort, setSort] = useState<{ tab: string, column: string, dir: 'asc' | 'desc' } | null>(null)
  const [pinnedFirstColumn, setPinnedFirstColumn] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      const [why, gl, bank, matches] = await Promise.all([
        api.getWhyCard(),
        api.listGlEntries(limit, offset),
        api.listBankTxns(limit, offset),
        api.listMatches(limit, offset),
      ])
      setState({ why, gl, bank, matches })
      try { setKpi(await api.getKpiCloseToCash()) } catch {}
      try { setControls(await api.listControlsLatest()) } catch {}
      try { setFlux(await api.listFlux(limit, offset)) } catch {}
      try { setForecast(await api.listForecast(limit, offset)) } catch {}
      try { setExceptions(await api.listExceptions(limit, offset, exceptionStatusFilter || undefined)) } catch {}
      try { setSpend(await api.listSpend(limit, offset)) } catch {}
      try { setKpiSpend(await api.getKpiSpend()) } catch {}
      try { setKpiTreasury(await api.getKpiTreasury()) } catch {}
      try { setPolicies(await api.listPolicies()) } catch {}
      try { const cash = await api.getTreasuryCash(14); setCashSeries(cash?.series || []) } catch {}
      try { setKpiAudit(await api.getKpiAudit()) } catch {}
      try { setKpiDQ(await api.getKpiDQ()) } catch {}
      try { const f = await api.getFeatures(); setFeatures(f.flags || f) } catch {}
      try { setJobRuns(await api.listJobRuns(20, 0)) } catch {}
      try { setInvoices(await api.listInvoices(20, 0)) } catch {}
      try { setEmployees(await api.listEmployees(20, 0)) } catch {}
    })()
  }, [api, limit, offset, exceptionStatusFilter])

  const sample = useMemo(() => state.why, [state])
  const whyCard = useMemo(() => {
    const hasWhy = sample && typeof sample === 'object' && Object.keys(sample || {}).length > 0
    if (hasWhy) return sample
    if (controls && controls.length > 0) {
      const c = controls[0]
      const items = (c?.findings?.items as any[]) || []
      const first = items[0] || {}
      return {
        policy: c.control_key,
        inputs: first,
        tools_used: ['rule-engine'],
        result: { findings_count: items.length, window_start: c.window_start, window_end: c.window_end },
        receipt: c.receipt_id ? { id: c.receipt_id, url: `/receipts/${c.receipt_id}` } : null,
        kpi_snapshot: kpi || {},
      }
    }
    return { kpi_snapshot: kpi || {} }
  }, [sample, controls, kpi])

  const kpiCards = useMemo(() => {
    const pct = (n: number | undefined | null) => (typeof n === 'number' ? `${n.toFixed(1)}%` : '-')
    return [
      { title: 'Auto Match Rate', value: pct(kpi?.auto_match_rate), trend: [50, 55, 60, 58, 62, 65, 66, 67, 68, 70, 72, 75] },
      { title: 'Controls Pass', value: pct(kpi?.controls_pass_rate), trend: [80, 81, 82, 83, 84, 85, 86, 84, 85, 86, 87, 88] },
      { title: 'Exceptions Open', value: kpi?.exceptions_open ?? '-', trend: [40, 38, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27] },
      { title: 'Flux Ready', value: pct(kpi?.flux_ready_percent), trend: [40, 45, 48, 52, 55, 57, 60, 62, 64, 66, 68, 70] },
      { title: 'GL Count', value: kpi?.gl_count ?? '-', trend: [10, 12, 11, 13, 12, 14, 16, 15, 17, 18, 19, 20] },
      { title: 'Bank Count', value: kpi?.bank_count ?? '-', trend: [9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15] },
      { title: 'Matched', value: kpi?.matched_count ?? '-', trend: [6, 7, 7, 8, 8, 9, 10, 10, 11, 12, 13, 14] },
      { title: 'MTTR (days)', value: kpi?.exceptions_mttr_days ?? '-', trend: [5, 4.8, 4.6, 4.4, 4.2, 4.0, 3.8, 3.6, 3.4, 3.3, 3.2, 3.2] },
    ]
  }, [kpi])

  const sparkPath = (values: number[], width: number, height: number, pad = 4) => {
    if (!values || values.length === 0) return ''
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const sx = (width - pad * 2) / (Math.max(1, values.length - 1))
    const pts = values.map((v, i) => {
      const x = pad + i * sx
      const y = height - pad - ((v - min) / range) * (height - pad * 2)
      return `${x},${y}`
    })
    return `M ${pts.join(' L ')}`
  }

  const areaPath = (values: number[], width: number, height: number, pad = 4) => {
    if (!values || values.length === 0) return ''
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const sx = (width - pad * 2) / (Math.max(1, values.length - 1))
    const top = values.map((v, i) => {
      const x = pad + i * sx
      const y = height - pad - ((v - min) / range) * (height - pad * 2)
      return `${x},${y}`
    })
    return `M ${top.join(' L ')} L ${width - pad},${height - pad} L ${pad},${height - pad} Z`
  }

  const tabs = useMemo(() => [
    { id: 'GL', label: 'GL' },
    { id: 'Bank', label: 'Bank' },
    { id: 'Matches', label: 'Matches' },
    { id: 'Flux', label: 'Flux' },
    { id: 'Forecast', label: 'Forecast' },
    { id: 'Exceptions', label: 'Exceptions' },
    { id: 'Spend', label: 'Spend' },
    { id: 'Policies', label: 'Policies' },
  ], [])

  const openReceipt = async (id: string) => {
    try {
      setDrawerOpen(true)
      setDrawerId(id)
      setDrawerJson(null)
      // Try to fetch receipt header/payload if available
      const res = await fetch(`/api/receipts/${encodeURIComponent(id)}`)
      if (res.ok) {
        const j = await res.json()
        setDrawerJson(j)
        return
      }
    } catch {}
    // Fallback to verify-only response
    try {
      const v = await api.verifyReceiptById(id)
      setDrawerJson(v)
    } catch {
      setDrawerJson({ id, error: 'unable to load' })
    }
  }

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text }}>
      <header style={{ padding: 16, borderBottom: `1px solid ${colors.panel}`, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, background: colors.bg, zIndex: 2 }}>
        <img src="wordmark_dc.png" alt="DeepChief" height={28} />
        <h1 style={{ margin: 0 }}>Console</h1>
      </header>
      <div style={{ maxWidth: 1200, margin: '24px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        <nav style={{ position: 'sticky', top: 72, alignSelf: 'start' }}>
          <a href="#close-to-cash" style={{ display: 'block', padding: '8px 10px', borderRadius: 6, color: colors.text, textDecoration: 'none' }}>Close-to-Cash</a>
          <a href="#controls" style={{ display: 'block', padding: '8px 10px', borderRadius: 6, color: colors.text, textDecoration: 'none' }}>Controls</a>
          <a href="#spend" style={{ display: 'block', padding: '8px 10px', borderRadius: 6, color: colors.text, textDecoration: 'none' }}>Spend</a>
          <a href="#audit" style={{ display: 'block', padding: '8px 10px', borderRadius: 6, color: colors.text, textDecoration: 'none' }}>Audit</a>
        </nav>
        <main style={{ minWidth: 0 }}>
          {kpi && (
            <section id="close-to-cash" style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <h2 style={{ marginTop: 0 }}>KPIs</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(180px,1fr))', gap: 12 }}>
                {kpiCards.map((card, i) => (
                  <div key={i} style={{ background: '#0f1830', border: '1px solid #1a2a4a', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 12, color: '#8b99b5' }}>{card.title}</div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{String(card.value)}</div>
                    <svg width={160} height={36}>
                      <defs>
                        <linearGradient id={`g${i}`} x1="0" x2="1" y1="0" y2="0">
                          <stop offset="0%" stopColor="#57a6ff" />
                          <stop offset="100%" stopColor="#2ecc71" />
                        </linearGradient>
                      </defs>
                      <path d={sparkPath(card.trend as number[], 160, 36)} fill="none" stroke={`url(#g${i})`} strokeWidth={2} />
                    </svg>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <svg viewBox={`0 0 ${800} ${140}`} width="100%" height={140}>
                  <path d={areaPath((cashSeries || []).map((x: any) => Number(x.balance ?? 0)), 800, 140)} fill="rgba(87,166,255,.15)" stroke="#57a6ff" strokeWidth={2} />
                </svg>
              </div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px,1fr))', gap: 12, alignItems: 'center' }}>
                {/* Controls pass donut */}
                <section>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#8b99b5' }}>Controls Pass</h3>
                  {(() => {
                    const pct = typeof kpi?.controls_pass_rate === 'number' ? Math.max(0, Math.min(100, kpi.controls_pass_rate)) : 0
                    const r = 36
                    const cx = 60
                    const cy = 60
                    const circ = 2 * Math.PI * r
                    const dash = (pct / 100) * circ
                    return (
                      <svg width={160} height={120} viewBox="0 0 120 120">
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2a4a" strokeWidth={10} />
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2ecc71" strokeWidth={10} strokeDasharray={`${dash} ${circ - dash}`} transform={`rotate(-90 ${cx} ${cy})`} />
                        <text x={cx} y={cy + 5} textAnchor="middle" fill={colors.text} style={{ fontSize: 14 }}>{pct.toFixed(1)}%</text>
                        <title>{`Controls pass rate: ${pct.toFixed(1)}%`}</title>
                      </svg>
                    )
                  })()}
                </section>
                {/* Exceptions histogram */}
                <section>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#8b99b5' }}>Exceptions by Type</h3>
                  {(() => {
                    const counts: Record<string, number> = {}
                    ;(exceptions || []).forEach((e: any) => { const t = String(e?.type || 'other'); counts[t] = (counts[t] || 0) + 1 })
                    const types = Object.keys(counts).slice(0, 6)
                    const maxV = Math.max(1, ...types.map(t => counts[t]))
                    const svgW = 260, svgH = 120, pad = 20
                    const bw = Math.max(12, (svgW - pad * 2) / Math.max(1, types.length) - 8)
                    return (
                      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                        {types.map((t, i) => {
                          const v = counts[t]
                          const h = (v / maxV) * (svgH - pad * 2)
                          const x = pad + i * (bw + 8)
                          const y = svgH - pad - h
                          return (
                            <g key={t}>
                              <rect x={x} y={y} width={bw} height={h} fill="#57a6ff">
                                <title>{`${t}: ${v}`}</title>
                              </rect>
                              <text x={x + bw / 2} y={svgH - 4} textAnchor="middle" fill="#8b99b5" style={{ fontSize: 10 }}>{t}</text>
                            </g>
                          )
                        })}
                      </svg>
                    )
                  })()}
                </section>
                {/* Flux waterfall */}
                <section>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#8b99b5' }}>Flux Waterfall</h3>
                  {(() => {
                    const f = Array.isArray(flux) && flux[0] ? flux[0] : null
                    const drivers: Record<string, number> = (f?.drivers as any) || { volume: 0.6, price: 0.3, fx: 0.1 }
                    const rows = Object.entries(drivers).map(([k, v]) => ({ key: k, value: Number(v) }))
                    const svgW = 260, svgH = 120, pad = 12, barH = 12, gap = 10
                    let y = svgH / 2
                    return (
                      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                        {rows.map((d, i) => {
                          const w = Math.max(10, Math.abs(d.value) * (svgW - pad * 2 - 40))
                          const x = pad
                          const el = (
                            <g key={d.key}>
                              <rect x={x} y={y - barH / 2} width={w} height={barH} fill={d.value >= 0 ? '#2ecc71' : '#e74c3c'}>
                                <title>{`${d.key}: ${(d.value*100).toFixed(1)}%`}</title>
                              </rect>
                              <text x={x + w + 4} y={y + 4} fill={colors.text} style={{ fontSize: 11 }}>{d.key}</text>
                            </g>
                          )
                          y += barH + gap
                          return el
                        })}
                      </svg>
                    )
                  })()}
                </section>
              </div>
            </section>
          )}
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Why</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            {whyCard?.policy && (<span style={{ borderRadius: 999, padding: '2px 8px', background: 'rgba(46,204,113,.15)', color: '#2ecc71', fontSize: 12 }}>{whyCard.policy}</span>)}
            {whyCard?.result?.flag && (<span style={{ borderRadius: 999, padding: '2px 8px', background: 'rgba(243,156,18,.15)', color: '#f39c12', fontSize: 12 }}>{whyCard.result.flag}</span>)}
            {whyCard?.receipt?.id && (
              <a href="#" onClick={(e) => { e.preventDefault(); openReceipt(whyCard.receipt.id) }} style={{ fontSize: 12 }}>
                {whyCard.receipt.id}
              </a>
            )}
            <button onClick={() => setShowWhyJson(v => !v)} style={{ marginLeft: 'auto' }}>{showWhyJson ? 'Hide' : 'Expand'}</button>
          </div>
          {showWhyJson && <JsonView data={whyCard} style={darkStyles} />}
        </section>
        {invoices.length > 0 && (
          <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>Billing Invoices</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">Invoice</th>
                  <th align="left">Vendor</th>
                  <th align="right">Amount</th>
                  <th align="left">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((r, i) => (
                  <tr key={i}>
                    <td>{r.invoice_id}</td>
                    <td>{r.vendor}</td>
                    <td style={{ textAlign: 'right' }}>{r.amount != null ? Number(r.amount).toFixed(2) : '-'}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {employees.length > 0 && (
          <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>HRIS Employees</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">Name</th>
                  <th align="left">Department</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((r, i) => (
                  <tr key={i}>
                    <td>{r.employee_id}</td>
                    <td>{r.name}</td>
                    <td>{r.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {features && (
          <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>Feature Flags</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.keys(features).map((k) => (
                <label key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={!!features[k]} onChange={async (e) => {
                    const next = await api.setFeature(k, e.target.checked)
                    const v = next[k] != null ? next[k] : (next.flags ? next.flags[k] : e.target.checked)
                    setFeatures({ ...(features || {}), [k]: v })
                  }} /> {k}
                </label>
              ))}
            </div>
          </section>
        )}
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16, position: 'sticky', top: 72, zIndex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Receipt Verify</h2>
          <form onSubmit={async (e) => { e.preventDefault(); const res = await api.verifyReceipt(verifyForm); setVerifyResult(res.valid ? 'Valid' : 'Invalid') }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <input placeholder="payload_hash_b64" value={verifyForm.payload_hash_b64} onChange={e => setVerifyForm({ ...verifyForm, payload_hash_b64: e.target.value })} />
              <input placeholder="signature_b64" value={verifyForm.signature_b64} onChange={e => setVerifyForm({ ...verifyForm, signature_b64: e.target.value })} />
              <input placeholder="public_key_b64" value={verifyForm.public_key_b64} onChange={e => setVerifyForm({ ...verifyForm, public_key_b64: e.target.value })} />
              <button type="submit">Verify</button>
            </div>
          </form>
          {verifyResult && <p>Result: {verifyResult}</p>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <input placeholder="verify by receipt id" value={verifyId} onChange={e => setVerifyId(e.target.value)} />
            <button onClick={async () => { if (!verifyId.trim()) return; const res = await api.verifyReceiptById(verifyId.trim()); alert(`hash_matches=${res.hash_matches}, signature_valid=${res.signature_valid}`) }}>Verify by ID</button>
          </div>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16, position: 'sticky', top: 160, zIndex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={async () => { await api.runIngest(); location.reload() }}>Run Ingest</button>
            <button onClick={async () => { await api.runReconciler(); location.reload() }}>Run Reconciler</button>
            <button onClick={async () => { await api.runControls(proposeMode ? 'propose' : undefined); location.reload() }}>Run Controls{proposeMode ? ' (Propose)' : ''}</button>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={proposeMode} onChange={e => setProposeMode(e.target.checked)} /> Propose mode
            </label>
            <button onClick={async () => { await api.runFlux(); location.reload() }}>Run Flux</button>
            <button onClick={async () => { await api.runForecast(); location.reload() }}>Run Forecast</button>
            <button onClick={async () => { await api.runExceptionTriage(); location.reload() }}>Run Exception Triage</button>
            <button onClick={async () => { await api.runDuplicate(); location.reload() }}>Run Duplicate Sentinel</button>
            <button onClick={async () => { await api.runSaas(); location.reload() }}>Run SaaS Optimizer</button>
            <span>|</span>
            <input placeholder="receipt ids (comma-separated)" value={packIds} onChange={e => setPackIds(e.target.value)} style={{ minWidth: 260 }} />
            <button onClick={() => { if (packIds.trim()) window.open(`/api/receipts/pack?ids=${encodeURIComponent(packIds.trim())}`, '_blank') }}>Download Receipts Pack</button>
            <span>|</span>
            {/* CSV for current tab */}
            {activeTab === 'GL' && (
              <a href={`/api/gl_entries.csv?limit=${limit}&offset=${offset}`} target="_blank" rel="noreferrer">Download CSV (GL)</a>
            )}
            {activeTab === 'Bank' && (
              <a href={`/api/bank_txns.csv?limit=${limit}&offset=${offset}`} target="_blank" rel="noreferrer">Download CSV (Bank)</a>
            )}
            {activeTab === 'Matches' && (
              <a href={`/api/matches.csv?limit=${limit}&offset=${offset}`} target="_blank" rel="noreferrer">Download CSV (Matches)</a>
            )}
            {activeTab === 'Flux' && (
              <a href={`/api/flux/flux.csv?limit=${limit}&offset=${offset}`} target="_blank" rel="noreferrer">Download CSV (Flux)</a>
            )}
            {activeTab === 'Forecast' && (
              <a href={`/api/forecast/forecast.csv?limit=${limit}&offset=${offset}`} target="_blank" rel="noreferrer">Download CSV (Forecast)</a>
            )}
            {activeTab === 'Exceptions' && (
              <a href={`/api/exceptions.csv?limit=${limit}&offset=${offset}${exceptionStatusFilter ? `&status=${encodeURIComponent(exceptionStatusFilter)}` : ''}`} target="_blank" rel="noreferrer">Download CSV (Exceptions)</a>
            )}
            {activeTab === 'Policies' && (
              <a href={`/api/controls/latest.csv?limit=${limit}`} target="_blank" rel="noreferrer">Download CSV (Controls Latest)</a>
            )}
            {activeTab === 'Spend' && (
              <a href={`/api/spend/spend.csv?limit=${limit}&offset=${offset}`} target="_blank" rel="noreferrer">Download CSV (Spend)</a>
            )}
            <span>|</span>
            <span>Page:</span>
            <input type="number" min={1} value={Math.floor(offset / Math.max(1, limit)) + 1}
              onChange={e => { const page = Math.max(1, parseInt(e.target.value || '1', 10)); setOffset((page - 1) * Math.max(1, limit)); }} style={{ width: 60 }} />
            <span>Limit:</span>
            <input type="number" min={1} value={limit} onChange={e => setLimit(Math.max(1, parseInt(e.target.value || '1', 10)))} style={{ width: 80 }} />
            <span>|</span>
            <button onClick={async () => { await api.runDQ(); location.reload() }}>Run DQ Sentinel</button>
          </div>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Policies</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Key</th>
                <th align="left">Active</th>
                <th align="left">Checksum</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p, i) => (
                <tr key={i}>
                  <td>{p.key}</td>
                  <td>{String(p.active)}</td>
                  <td>{p.checksum?.slice(0, 10)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Treasury Cash (14d)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Date</th>
                <th align="right">Inflow</th>
                <th align="right">Outflow</th>
                <th align="right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {cashSeries.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td style={{ textAlign: 'right' }}>{Number(r.inflow).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(r.outflow).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(r.balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {(kpiAudit || kpiDQ) && (
          <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>Audit</h2>
            {kpiAudit && <div>Receipts Total: {kpiAudit.receipts_total}</div>}
            {kpiDQ && (
              <div style={{ marginTop: 8 }}>
                <strong>DQ Freshness</strong>: GL {kpiDQ.gl_days_since ?? '-'}d, Bank {kpiDQ.bank_days_since ?? '-'}d
              </div>
            )}
          </section>
        )}
        {jobRuns.length > 0 && (
          <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>Job Runs</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">Agent</th>
                  <th align="left">Status</th>
                  <th align="left">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {jobRuns.map((r, i) => (
                  <tr key={i}>
                    <td>{r.id}</td>
                    <td>{r.agent}</td>
                    <td>{r.status}</td>
                    <td>{r.receipt_id ? <a href="#" onClick={(e) => { e.preventDefault(); openReceipt(r.receipt_id) }}>{r.receipt_id}</a> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid #1a2a4a`, marginBottom: 8 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '8px 10px', borderRadius: 6, background: activeTab === t.id ? '#0f1830' : 'transparent', border: '1px solid #1a2a4a', color: colors.text }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <input placeholder="Search (id/vendor/account)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ minWidth: 260 }} />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={tableDensity === 'compact'} onChange={e => setTableDensity(e.target.checked ? 'compact' : 'comfortable')} /> Compact
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={pinnedFirstColumn} onChange={e => setPinnedFirstColumn(e.target.checked)} /> Pin first column
            </label>
            <span style={{ color: '#8b99b5' }}>Last run: {jobRuns[0]?.ended_at || jobRuns[0]?.started_at || '—'}</span>
          </div>
          {activeTab === 'GL' && (
            <div>
              <h2 style={{ marginTop: 0 }}>GL Entries</h2>
              {loading ? (
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (<div key={i} style={{ height: 16, background: '#0f1830', borderRadius: 6, margin: '6px 0' }} />))}
                </div>
              ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: tableDensity === 'compact' ? 12 : 14 }}>
                <thead>
                  <tr>
                    <th align="left" style={{ position: pinnedFirstColumn ? 'sticky' as const : undefined, left: pinnedFirstColumn ? 0 : undefined, background: pinnedFirstColumn ? '#0f1830' : undefined }}><button onClick={() => setSort(prev => ({ tab: 'GL', column: 'id', dir: prev?.tab==='GL' && prev.column==='id' && prev.dir==='asc' ? 'desc':'asc' }))}>ID</button></th>
                    <th align="left"><button onClick={() => setSort(prev => ({ tab: 'GL', column: 'entity_id', dir: prev?.tab==='GL' && prev.column==='entity_id' && prev.dir==='asc' ? 'desc':'asc' }))}>Entity</button></th>
                    <th align="left"><button onClick={() => setSort(prev => ({ tab: 'GL', column: 'account', dir: prev?.tab==='GL' && prev.column==='account' && prev.dir==='asc' ? 'desc':'asc' }))}>Account</button></th>
                    <th align="right"><button onClick={() => setSort(prev => ({ tab: 'GL', column: 'amount', dir: prev?.tab==='GL' && prev.column==='amount' && prev.dir==='asc' ? 'desc':'asc' }))}>Amount</button></th>
                    <th align="left"><button onClick={() => setSort(prev => ({ tab: 'GL', column: 'date', dir: prev?.tab==='GL' && prev.column==='date' && prev.dir==='asc' ? 'desc':'asc' }))}>Date</button></th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const q = searchQuery.toLowerCase().trim()
                    const rows = (state.gl || []).filter((r: any) => {
                      if (!q) return true
                      return String(r.id).toLowerCase().includes(q) || String(r.entity_id).toLowerCase().includes(q) || String(r.account).toLowerCase().includes(q)
                    })
                    if (sort?.tab === 'GL') {
                      rows.sort((a: any, b: any) => {
                        const dir = sort.dir === 'asc' ? 1 : -1
                        const col = sort.column
                        const va = a[col]
                        const vb = b[col]
                        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
                        return String(va).localeCompare(String(vb)) * dir
                      })
                    }
                    if (rows.length === 0) return (<tr><td colSpan={5}>No GL entries</td></tr>)
                    return rows.map((r: any, i: number) => (
                      <tr key={i}>
                      <td style={{ position: pinnedFirstColumn ? 'sticky' as const : undefined, left: pinnedFirstColumn ? 0 : undefined, background: pinnedFirstColumn ? '#0f1830' : undefined }}>{r.id}</td>
                        <td>{r.entity_id}</td>
                        <td>{r.account}</td>
                        <td style={{ textAlign: 'right' }}>{Number(r.amount).toFixed(2)}</td>
                        <td>{r.date}</td>
                      </tr>
                    ))
                  })()}
                </tbody>
              </table>
              )}
            </div>
          )}
          {activeTab === 'Bank' && (
            <div>
              <h2 style={{ marginTop: 0 }}>Bank Transactions</h2>
              {loading ? (
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (<div key={i} style={{ height: 16, background: '#0f1830', borderRadius: 6, margin: '6px 0' }} />))}
                </div>
              ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: tableDensity === 'compact' ? 12 : 14 }}>
                <thead>
                  <tr>
                    <th align="left" style={{ position: pinnedFirstColumn ? 'sticky' as const : undefined, left: pinnedFirstColumn ? 0 : undefined, background: pinnedFirstColumn ? '#0f1830' : undefined }}><button onClick={() => setSort(prev => ({ tab: 'Bank', column: 'id', dir: prev?.tab==='Bank' && prev.column==='id' && prev.dir==='asc' ? 'desc':'asc' }))}>ID</button></th>
                    <th align="left"><button onClick={() => setSort(prev => ({ tab: 'Bank', column: 'account_ref', dir: prev?.tab==='Bank' && prev.column==='account_ref' && prev.dir==='asc' ? 'desc':'asc' }))}>Account</button></th>
                    <th align="right"><button onClick={() => setSort(prev => ({ tab: 'Bank', column: 'amount', dir: prev?.tab==='Bank' && prev.column==='amount' && prev.dir==='asc' ? 'desc':'asc' }))}>Amount</button></th>
                    <th align="left"><button onClick={() => setSort(prev => ({ tab: 'Bank', column: 'date', dir: prev?.tab==='Bank' && prev.column==='date' && prev.dir==='asc' ? 'desc':'asc' }))}>Date</button></th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const q = searchQuery.toLowerCase().trim()
                    const rows = (state.bank || []).filter((r: any) => {
                      if (!q) return true
                      return String(r.id).toLowerCase().includes(q) || String(r.account_ref).toLowerCase().includes(q)
                    })
                    if (sort?.tab === 'Bank') {
                      rows.sort((a: any, b: any) => {
                        const dir = sort.dir === 'asc' ? 1 : -1
                        const col = sort.column
                        const va = a[col]
                        const vb = b[col]
                        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
                        return String(va).localeCompare(String(vb)) * dir
                      })
                    }
                    if (rows.length === 0) return (<tr><td colSpan={4}>No bank transactions</td></tr>)
                    return rows.map((r: any, i: number) => (
                      <tr key={i}>
                      <td style={{ position: pinnedFirstColumn ? 'sticky' as const : undefined, left: pinnedFirstColumn ? 0 : undefined, background: pinnedFirstColumn ? '#0f1830' : undefined }}>{r.id}</td>
                        <td>{r.account_ref}</td>
                        <td style={{ textAlign: 'right' }}>{Number(r.amount).toFixed(2)}</td>
                        <td>{r.date}</td>
                      </tr>
                    ))
                  })()}
                </tbody>
              </table>
              )}
            </div>
          )}
          {activeTab === 'Matches' && (
            <div>
              <h2 style={{ marginTop: 0 }}>Matches</h2>
              {loading ? (
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (<div key={i} style={{ height: 16, background: '#0f1830', borderRadius: 6, margin: '6px 0' }} />))}
                </div>
              ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: tableDensity === 'compact' ? 12 : 14 }}>
                <thead>
                  <tr>
                    <th align="left" style={{ position: pinnedFirstColumn ? 'sticky' as const : undefined, left: pinnedFirstColumn ? 0 : undefined, background: pinnedFirstColumn ? '#0f1830' : undefined }}><button onClick={() => setSort(prev => ({ tab: 'Matches', column: 'gl_entry_id', dir: prev?.tab==='Matches' && prev.column==='gl_entry_id' && prev.dir==='asc' ? 'desc':'asc' }))}>GL Entry</button></th>
                    <th align="left"><button onClick={() => setSort(prev => ({ tab: 'Matches', column: 'bank_txn_id', dir: prev?.tab==='Matches' && prev.column==='bank_txn_id' && prev.dir==='asc' ? 'desc':'asc' }))}>Bank Txn</button></th>
                    <th align="right"><button onClick={() => setSort(prev => ({ tab: 'Matches', column: 'confidence', dir: prev?.tab==='Matches' && prev.column==='confidence' && prev.dir==='asc' ? 'desc':'asc' }))}>Confidence</button></th>
                    <th align="left">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const q = searchQuery.toLowerCase().trim()
                    const rows = (state.matches || []).filter((r: any) => {
                      if (!q) return true
                      return String(r.gl_entry_id).toLowerCase().includes(q) || String(r.bank_txn_id).toLowerCase().includes(q)
                    })
                    if (sort?.tab === 'Matches') {
                      rows.sort((a: any, b: any) => {
                        const dir = sort.dir === 'asc' ? 1 : -1
                        const col = sort.column
                        const va = a[col]
                        const vb = b[col]
                        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
                        return String(va).localeCompare(String(vb)) * dir
                      })
                    }
                    if (rows.length === 0) return (<tr><td colSpan={4}>No matches</td></tr>)
                    return rows.map((r: any, i: number) => {
                      const conf = Number(r.confidence)
                      const color = conf >= 0.9 ? '#2ecc71' : conf >= 0.7 ? '#f39c12' : '#e74c3c'
                      return (
                        <tr key={i}>
                          <td style={{ position: pinnedFirstColumn ? 'sticky' as const : undefined, left: pinnedFirstColumn ? 0 : undefined, background: pinnedFirstColumn ? '#0f1830' : undefined }}>{r.gl_entry_id}</td>
                          <td>{r.bank_txn_id}</td>
                          <td style={{ textAlign: 'right', color }}>{conf.toFixed(2)}</td>
                          <td>{r.receipt_id ? <a href={"#/"} onClick={(e) => { e.preventDefault(); openReceipt(r.receipt_id) }}>{r.receipt_id}</a> : '-'}</td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
              )}
            </div>
          )}
          {activeTab === 'Flux' && (
            <div>
              <h2 style={{ marginTop: 0 }}>Flux</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">Entity</th>
                    <th align="left">Account</th>
                    <th align="left">Period</th>
                    <th align="left">Drivers</th>
                    <th align="left">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {flux.map((r, i) => (
                    <tr key={i}>
                      <td>{r.entity_id}</td>
                      <td>{r.account}</td>
                      <td>{r.period}</td>
                      <td>{JSON.stringify(r.drivers)}</td>
                      <td>{r.receipt_id ? <a href="#" onClick={(e) => { e.preventDefault(); openReceipt(r.receipt_id) }}>{r.receipt_id}</a> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'Forecast' && (
            <div>
              <h2 style={{ marginTop: 0 }}>Forecast</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">Period</th>
                    <th align="left">Params</th>
                    <th align="left">Outputs</th>
                    <th align="left">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((r, i) => (
                    <tr key={i}>
                      <td>{r.period}</td>
                      <td>{JSON.stringify(r.params)}</td>
                      <td>{JSON.stringify(r.outputs)}</td>
                      <td>{r.receipt_id ? <a href="#" onClick={(e) => { e.preventDefault(); openReceipt(r.receipt_id) }}>{r.receipt_id}</a> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Forecast cone (P50/P75/P90) */}
              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#8b99b5' }}>Forecast Cone (P50/P75/P90)</h3>
                {(() => {
                  const W = 320, H = 140, pad = 16
                  // base from last cashSeries balance if available
                  let base = 150000
                  try { if (Array.isArray(cashSeries) && cashSeries.length) base = Number((cashSeries[cashSeries.length - 1] as any).balance ?? base) } catch {}
                  const steps = 10
                  const p50 = Array.from({ length: steps }, (_, i) => base + i * 800)
                  const p75 = p50.map((v, i) => v + i * 250)
                  const p90 = p50.map((v, i) => v + i * 450)
                  const minV = Math.min(base, ...p50)
                  const maxV = Math.max(...p90)
                  const scaleY = (val: number) => {
                    const r = maxV - minV || 1
                    return H - pad - ((val - minV) / r) * (H - pad * 2)
                  }
                  const scaleX = (i: number) => pad + (i / Math.max(1, steps - 1)) * (W - pad * 2)
                  const pathArea = (upper: number[], lower: number[]) => {
                    const up = upper.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(' L ')
                    const lo = lower.slice().reverse().map((v, i) => `${scaleX(steps - 1 - i)},${scaleY(v)}`).join(' L ')
                    return `M ${up} L ${lo} Z`
                  }
                  const d90 = pathArea(p90, p50)
                  const d75 = pathArea(p75, p50)
                  const d50 = `M ${p50.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(' L ')}`
                  return (
                    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                      <path d={d90} fill={'rgba(87,166,255,.15)'} />
                      <path d={d75} fill={'rgba(46,204,113,.18)'} />
                      <path d={d50} fill="none" stroke="#57a6ff" strokeWidth={2} />
                    </svg>
                  )
                })()}
              </div>
            </div>
          )}
          {activeTab === 'Exceptions' && (
            <div>
              <h2 style={{ marginTop: 0 }}>Exceptions</h2>
              <div style={{ marginBottom: 8 }}>
                <select value={exceptionStatusFilter} onChange={e => setExceptionStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              {loading ? (
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (<div key={i} style={{ height: 16, background: '#0f1830', borderRadius: 6, margin: '6px 0' }} />))}
                </div>
              ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">ID</th>
                    <th align="left">Type</th>
                    <th align="left">Status</th>
                    <th align="left">Assignee</th>
                    <th align="left">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.length === 0 && <tr><td colSpan={5}>No exceptions</td></tr>}
                  {exceptions.filter(r => !exceptionStatusFilter || r.status === exceptionStatusFilter).map((r, i) => {
                    const isOpen = r.status === 'open'
                    return (
                      <tr key={i}>
                        <td>{r.id}</td>
                        <td>{r.type}</td>
                        <td>
                          <span style={{ borderRadius: 999, padding: '2px 8px', fontSize: 12, background: isOpen ? 'rgba(243,156,18,.15)' : 'rgba(46,204,113,.15)', color: isOpen ? '#f39c12' : '#2ecc71' }}>
                            {r.status}
                          </span>
                        </td>
                        <td>{r.assignee || '-'}</td>
                        <td>{r.receipt_id ? <a href="#" onClick={(e) => { e.preventDefault(); openReceipt(r.receipt_id) }}>{r.receipt_id}</a> : '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              )}
            </div>
          )}
          {activeTab === 'Spend' && (
            <div>
              <h2 style={{ marginTop: 0 }}>Spend</h2>
              {loading ? (
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (<div key={i} style={{ height: 16, background: '#0f1830', borderRadius: 6, margin: '6px 0' }} />))}
                </div>
              ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">Type</th>
                    <th align="left">Vendor</th>
                    <th align="right">Amount</th>
                    <th align="left">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {spend.length === 0 && <tr><td colSpan={4}>No spend issues</td></tr>}
                  {spend.map((r, i) => {
                    const t = String(r.type || '')
                    const isDup = t.toLowerCase().includes('dup')
                    const isSaas = t.toLowerCase().includes('saas')
                    const bg = isDup || isSaas ? 'rgba(243,156,18,.15)' : 'rgba(139,153,181,.15)'
                    const fg = isDup || isSaas ? '#f39c12' : '#8b99b5'
                    return (
                      <tr key={i}>
                        <td><span style={{ borderRadius: 999, padding: '2px 8px', fontSize: 12, background: bg, color: fg }}>{r.type}</span></td>
                        <td>{r.vendor || '-'}</td>
                        <td style={{ textAlign: 'right' }}>{r.amount != null ? Number(r.amount).toFixed(2) : '-'}</td>
                        <td>{r.receipt_id ? <a href="#" onClick={(e) => { e.preventDefault(); openReceipt(r.receipt_id) }}>{r.receipt_id}</a> : '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              )}
              {/* Spend visuals: Pareto and Treemap */}
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px,1fr))', gap: 12, alignItems: 'center' }}>
                {/* Pareto */}
                <section>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#8b99b5' }}>Spend Pareto (Top Vendors)</h3>
                  {(() => {
                    const sums: Record<string, number> = {}
                    ;(spend || []).forEach((s: any) => { const v = String(s.vendor || 'Other'); const amt = Number(s.amount || 0); sums[v] = (sums[v] || 0) + amt })
                    const entries = Object.entries(sums).map(([vendor, total]) => ({ vendor, total: Number(total) })).sort((a, b) => b.total - a.total).slice(0, 8)
                    const totalAll = entries.reduce((acc, x) => acc + x.total, 0) || 1
                    const W = 300, H = 140, pad = 28, bar = 12, gap = 8
                    let y = pad
                    return (
                      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                        {entries.map(e => {
                          const w = Math.max(4, (e.total / totalAll) * (W - pad * 2))
                          const g = (
                            <g key={e.vendor}>
                              <text x={pad} y={y - 4} fill="#8b99b5" style={{ fontSize: 10 }}>{e.vendor}</text>
                              <rect x={pad} y={y} width={w} height={bar} fill="#57a6ff">
                                <title>{`${e.vendor}: $${e.total.toFixed(2)}`}</title>
                              </rect>
                            </g>
                          )
                          y += bar + gap
                          return g
                        })}
                      </svg>
                    )
                  })()}
                </section>
                {/* Treemap (simple row layout) */}
                <section>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#8b99b5' }}>Spend Treemap (Simple)</h3>
                  {(() => {
                    const sums: Record<string, number> = {}
                    ;(spend || []).forEach((s: any) => { const v = String(s.vendor || 'Other'); const amt = Number(s.amount || 0); sums[v] = (sums[v] || 0) + amt })
                    const entries = Object.entries(sums).map(([vendor, total]) => ({ vendor, total: Number(total) })).sort((a, b) => b.total - a.total).slice(0, 8)
                    const totalAll = entries.reduce((acc, x) => acc + x.total, 0) || 1
                    const W = 300, H = 140, pad = 8
                    const usableW = W - pad * 2, usableH = H - pad * 2
                    let x = pad
                    return (
                      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                        {entries.map((e, i) => {
                          const w = Math.max(8, (e.total / totalAll) * usableW)
                          const g = (
                            <g key={e.vendor}>
                              <rect x={x} y={pad} width={w} height={usableH} fill={i % 2 === 0 ? '#2ecc71' : '#57a6ff'}>
                                <title>{`${e.vendor}: $${e.total.toFixed(2)}`}</title>
                              </rect>
                              <text x={x + 4} y={pad + 12} fill={colors.bg} style={{ fontSize: 10 }}>{e.vendor}</text>
                            </g>
                          )
                          x += w + 2
                          return g
                        })}
                      </svg>
                    )
                  })()}
                </section>
              </div>
            </div>
          )}
          {activeTab === 'Policies' && (
            <div>
              <h2 style={{ marginTop: 0 }}>Policies</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">Key</th>
                    <th align="left">Active</th>
                    <th align="left">Checksum</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((p, i) => (
                    <tr key={i}>
                      <td>{p.key}</td>
                      <td>{String(p.active)}</td>
                      <td>{p.checksum?.slice(0, 10)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {drawerOpen && (
          <aside style={{ position: 'fixed', top: 0, right: 0, width: 420, maxWidth: '90vw', height: '100vh', background: '#0f1830', borderLeft: '1px solid #1a2a4a', boxShadow: '-12px 0 24px rgba(0,0,0,.3)', zIndex: 3, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: 12, borderBottom: '1px solid #1a2a4a' }}>
              <strong style={{ marginRight: 'auto' }}>Receipt {drawerId}</strong>
              <button onClick={() => setDrawerOpen(false)}>Close</button>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, padding: '12px 16px' }}>{drawerJson ? JSON.stringify(drawerJson, null, 2) : 'Loading...'}</pre>
          </aside>
        )}
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Controls</h2>
          <div style={{ marginBottom: 8 }}>
            <input placeholder="Filter control key" value={controlsKeyFilter} onChange={e => setControlsKeyFilter(e.target.value)} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Control</th>
                <th align="left">Window</th>
                <th align="left">Findings</th>
                <th align="left">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {controls.filter(r => !controlsKeyFilter || String(r.control_key).toLowerCase().includes(controlsKeyFilter.toLowerCase())).map((r, i) => (
                <tr key={i}>
                  <td>{r.control_key}</td>
                  <td>{r.window_start} → {r.window_end}</td>
                  <td>{Array.isArray(r.findings?.items) ? r.findings.items.length : 0}</td>
                  <td>{r.receipt_id ? <a href={`/receipts/${r.receipt_id}`} target="_blank" rel="noreferrer">{r.receipt_id}</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}


