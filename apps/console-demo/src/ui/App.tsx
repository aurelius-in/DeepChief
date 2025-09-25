import React from 'react'
import { ConsoleView } from './ConsoleView'

const demoApi = {
  async getWhyCard() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.whyCard
  },
  async listGlEntries() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.gl
  },
  async listBankTxns() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.bank
  },
  async verifyReceipt(req: any) {
    // Purely client-side display; mimic success
    return { valid: true }
  },
  async listMatches() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.matches ?? []
  },
  async runIngest() {
    return { ok: true }
  },
  async runReconciler() {
    return { matched: (await this.listMatches()).length }
  },
  async getKpiCloseToCash() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.kpi
  },
  async listControlsLatest() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.controls ?? []
  },
  async runControls() { return { ok: true } },
  async listFlux() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.flux ?? []
  },
  async runFlux() { return { ok: true } },
  async listForecast() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.forecast ?? []
  },
  async runForecast() { return { ok: true } },
  async listExceptions() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.exceptions ?? []
  },
  async runExceptionTriage() { return { ok: true } },
  async listSpend() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.spend ?? []
  },
  async runDuplicate() { return { ok: true } },
  async runSaas() { return { ok: true } },
  async getKpiSpend() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.kpi_spend ?? { issues_total: 0, duplicates: 0, saas: 0 }
  },
  async getKpiTreasury() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.kpi_treasury ?? { projected_buffer_days: 42, covenant_risk_flags: [] }
  },
  async listPolicies() {
    const r = await fetch('./demo_state.json')
    const j = await r.json()
    return j.policies ?? []
  },
  async verifyReceiptById(receiptId: string) {
    // demo always returns valid for presentation
    return { receipt_id: receiptId, hash_matches: true, signature_valid: true }
  },
}

export function App() {
  return <ConsoleView api={demoApi} />
}

import React, { useEffect, useMemo, useState } from 'react'
import { JsonView, darkStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

const colors = {
  bg: '#0b1321',
  panel: '#121b2e',
  text: '#e6edf6',
  accent: '#57a6ff',
}

type DemoState = {
  whyCard: any
  gl: any[]
  bank: any[]
}

export function App() {
  const [state, setState] = useState<DemoState | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('./demo_state.json').then(r => r.json()),
    ]).then(([data]) => {
      setState(data)
    })
  }, [])

  const sample = useMemo(() => state?.whyCard ?? {}, [state])

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text }}>
      <header style={{ padding: 16, borderBottom: `1px solid ${colors.panel}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="./wordmark_dc.png" alt="DeepChief" height={28} />
        <h1 style={{ margin: 0 }}>Console</h1>
      </header>
      <main style={{ maxWidth: 1200, margin: '24px auto', padding: '0 16px' }}>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Why Card</h2>
          <JsonView data={sample} style={darkStyles} />
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
              {(state?.gl ?? []).map((r, i) => (
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
              {(state?.bank ?? []).map((r, i) => (
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


