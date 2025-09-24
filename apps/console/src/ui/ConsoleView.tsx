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

type State = { why: any, gl: any[], bank: any[] }

export function ConsoleView({ api }: { api: Api }) {
  const [state, setState] = useState<State>({ why: {}, gl: [], bank: [] })
  const [verifyForm, setVerifyForm] = useState<ReceiptVerifyRequest>({ payload_hash_b64: '', signature_b64: '', public_key_b64: '' })
  const [verifyResult, setVerifyResult] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      const [why, gl, bank] = await Promise.all([
        api.getWhyCard(),
        api.listGlEntries(),
        api.listBankTxns(),
      ])
      setState({ why, gl, bank })
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
      </main>
    </div>
  )
}


