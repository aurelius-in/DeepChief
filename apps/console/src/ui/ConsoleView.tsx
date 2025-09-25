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

  useEffect(() => {
    ;(async () => {
      const [why, gl, bank, matches] = await Promise.all([
        api.getWhyCard(),
        api.listGlEntries(),
        api.listBankTxns(),
        api.listMatches(),
      ])
      setState({ why, gl, bank, matches })
      try { setKpi(await api.getKpiCloseToCash()) } catch {}
      try { setControls(await api.listControlsLatest()) } catch {}
      try { setFlux(await api.listFlux()) } catch {}
      try { setForecast(await api.listForecast()) } catch {}
      try { setExceptions(await api.listExceptions()) } catch {}
      try { setSpend(await api.listSpend()) } catch {}
      try { setKpiSpend(await api.getKpiSpend()) } catch {}
      try { setKpiTreasury(await api.getKpiTreasury()) } catch {}
    })()
  }, [api])

  const sample = useMemo(() => state.why, [state])

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text }}>
      <header style={{ padding: 16, borderBottom: `1px solid ${colors.panel}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/wordmark_dc.png" alt="DeepChief" height={28} />
        <h1 style={{ margin: 0 }}>Console</h1>
      </header>
      <main style={{ maxWidth: 1200, margin: '24px auto', padding: '0 16px' }}>
        {kpi && (
          <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>KPIs</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div>Auto Match Rate: {kpi.auto_match_rate}%</div>
              <div>GL: {kpi.gl_count}</div>
              <div>Bank: {kpi.bank_count}</div>
              <div>Matched: {kpi.matched_count}</div>
              <div>| Spend Issues: {kpiSpend?.issues_total ?? '-'}</div>
              <div>Duplicates: {kpiSpend?.duplicates ?? '-'}</div>
              <div>SaaS: {kpiSpend?.saas ?? '-'}</div>
              <div>| Buffer Days: {kpiTreasury?.projected_buffer_days ?? '-'}</div>
              <div>Flags: {Array.isArray(kpiTreasury?.covenant_risk_flags) ? kpiTreasury.covenant_risk_flags.map((f: any) => `${f.name}:${f.status}`).join(', ') : '-'}</div>
            </div>
          </section>
        )}
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Why Card</h2>
          <JsonView data={sample} style={darkStyles} />
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
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
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={async () => { await api.runIngest(); location.reload() }}>Run Ingest</button>
            <button onClick={async () => { await api.runReconciler(); location.reload() }}>Run Reconciler</button>
            <button onClick={async () => { await api.runControls(); location.reload() }}>Run Controls</button>
            <button onClick={async () => { await api.runFlux(); location.reload() }}>Run Flux</button>
            <button onClick={async () => { await api.runForecast(); location.reload() }}>Run Forecast</button>
            <button onClick={async () => { await api.runExceptionTriage(); location.reload() }}>Run Exception Triage</button>
            <button onClick={async () => { await api.runDuplicate(); location.reload() }}>Run Duplicate Sentinel</button>
            <button onClick={async () => { await api.runSaas(); location.reload() }}>Run SaaS Optimizer</button>
            <span>|</span>
            <input placeholder="receipt ids (comma-separated)" value={packIds} onChange={e => setPackIds(e.target.value)} style={{ minWidth: 260 }} />
            <button onClick={() => { if (packIds.trim()) window.open(`/api/receipts/pack?ids=${encodeURIComponent(packIds.trim())}`, '_blank') }}>Download Receipts Pack</button>
          </div>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>GL Entries</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">ID</th>
                <th align="left">Entity</th>
                <th align="left">Account</th>
                <th align="right">Amount</th>
                <th align="left">Date</th>
              </tr>
            </thead>
            <tbody>
              {state.gl.map((r, i) => (
                <tr key={i}>
                  <td>{r.id}</td>
                  <td>{r.entity_id}</td>
                  <td>{r.account}</td>
                  <td style={{ textAlign: 'right' }}>{Number(r.amount).toFixed(2)}</td>
                  <td>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Spend</h2>
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
              {spend.map((r, i) => (
                <tr key={i}>
                  <td>{r.type}</td>
                  <td>{r.vendor || '-'}</td>
                  <td style={{ textAlign: 'right' }}>{r.amount != null ? Number(r.amount).toFixed(2) : '-'}</td>
                  <td>{r.receipt_id ? <a href={`/receipts/${r.receipt_id}`} target="_blank" rel="noreferrer">{r.receipt_id}</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Exceptions</h2>
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
              {exceptions.map((r, i) => (
                <tr key={i}>
                  <td>{r.id}</td>
                  <td>{r.type}</td>
                  <td>{r.status}</td>
                  <td>{r.assignee || '-'}</td>
                  <td>{r.receipt_id ? <a href={`/receipts/${r.receipt_id}`} target="_blank" rel="noreferrer">{r.receipt_id}</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
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
                  <td>{r.receipt_id ? <a href={`/receipts/${r.receipt_id}`} target="_blank" rel="noreferrer">{r.receipt_id}</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
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
                  <td>{r.receipt_id ? <a href={`/receipts/${r.receipt_id}`} target="_blank" rel="noreferrer">{r.receipt_id}</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8 }}>
          <h2 style={{ marginTop: 0 }}>Bank Transactions</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">ID</th>
                <th align="left">Account</th>
                <th align="right">Amount</th>
                <th align="left">Date</th>
              </tr>
            </thead>
            <tbody>
              {state.bank.map((r, i) => (
                <tr key={i}>
                  <td>{r.id}</td>
                  <td>{r.account_ref}</td>
                  <td style={{ textAlign: 'right' }}>{Number(r.amount).toFixed(2)}</td>
                  <td>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Matches</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">GL Entry</th>
                <th align="left">Bank Txn</th>
                <th align="right">Confidence</th>
                <th align="left">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {state.matches.map((r, i) => (
                <tr key={i}>
                  <td>{r.gl_entry_id}</td>
                  <td>{r.bank_txn_id}</td>
                  <td style={{ textAlign: 'right' }}>{Number(r.confidence).toFixed(2)}</td>
                  <td>{r.receipt_id ? <a href={`/receipts/${r.receipt_id}`} target="_blank" rel="noreferrer">{r.receipt_id}</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Controls</h2>
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
              {controls.map((r, i) => (
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


