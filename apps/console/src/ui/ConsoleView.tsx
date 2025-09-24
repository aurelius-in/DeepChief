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

  useEffect(() => {
    ;(async () => {
      const [why, gl, bank, matches] = await Promise.all([
        api.getWhyCard(),
        api.listGlEntries(),
        api.listBankTxns(),
        api.listMatches(),
      ])
      setState({ why, gl, bank, matches })
      try {
        const res = await fetch('/api/kpi/close_to_cash')
        if (res.ok) setKpi(await res.json())
      } catch {}
      try {
        const res2 = await fetch('/api/controls/latest')
        if (res2.ok) setControls(await res2.json())
      } catch {}
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
            <div style={{ display: 'flex', gap: 16 }}>
              <div>Auto Match Rate: {kpi.auto_match_rate}%</div>
              <div>GL: {kpi.gl_count}</div>
              <div>Bank: {kpi.bank_count}</div>
              <div>Matched: {kpi.matched_count}</div>
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
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={async () => { await api.runIngest(); location.reload() }}>Run Ingest</button>
            <button onClick={async () => { await api.runReconciler(); location.reload() }}>Run Reconciler</button>
            <button onClick={async () => { await fetch('/api/controls/run', { method: 'POST' }); location.reload() }}>Run Controls</button>
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


