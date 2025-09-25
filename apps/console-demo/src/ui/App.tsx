import React from 'react'
import { ConsoleView } from './ConsoleView'

async function loadState() {
  const r = await fetch('./demo_state.json')
  return r.json()
}

const demoApi = {
  async getWhyCard() { const j = await loadState(); return j.whyCard },
  async listGlEntries() { const j = await loadState(); return j.gl },
  async listBankTxns() { const j = await loadState(); return j.bank },
  async verifyReceipt(req: any) { return { valid: true } },
  async listMatches() { const j = await loadState(); return j.matches ?? [] },
  async runIngest() { return { ok: true } },
  async runReconciler() { return { matched: (await this.listMatches()).length } },
  async getKpiCloseToCash() { const j = await loadState(); return j.kpi },
  async listControlsLatest() { const j = await loadState(); return j.controls ?? [] },
  async runControls() { return { ok: true } },
  async listFlux(limit: number = 100, offset: number = 0) { const j = await loadState(); const arr = j.flux ?? []; return arr.slice(offset, offset + limit) },
  async runFlux() { return { ok: true } },
  async listForecast(limit: number = 100, offset: number = 0) { const j = await loadState(); const arr = j.forecast ?? []; return arr.slice(offset, offset + limit) },
  async runForecast() { return { ok: true } },
  async listExceptions(limit: number = 100, offset: number = 0, status?: string) { const j = await loadState(); let arr = j.exceptions ?? []; if (status) arr = arr.filter((r: any) => r.status === status); return arr.slice(offset, offset + limit) },
  async runExceptionTriage() { return { ok: true } },
  async listSpend(limit: number = 100, offset: number = 0) { const j = await loadState(); const arr = j.spend ?? []; return arr.slice(offset, offset + limit) },
  async runDuplicate() { return { ok: true } },
  async runSaas() { return { ok: true } },
  async getKpiSpend() { const j = await loadState(); return j.kpi_spend ?? { issues_total: 0, duplicates: 0, saas: 0 } },
  async getKpiTreasury() { const j = await loadState(); return j.kpi_treasury ?? { projected_buffer_days: 42, covenant_risk_flags: [] } },
  async listPolicies() { const j = await loadState(); return j.policies ?? [] },
  async verifyReceiptById(receiptId: string) { return { receipt_id: receiptId, hash_matches: true, signature_valid: true } },
  async getTreasuryCash(days: number = 14) { const j = await loadState(); const s = (j.cash && Array.isArray(j.cash.series)) ? j.cash.series : []; return { series: s.slice(0, days) } },
  async getKpiAudit() { const j = await loadState(); return j.kpi_audit ?? { receipts_total: 0 } },
  async getKpiDQ() { const j = await loadState(); return j.kpi_dq ?? { gl_days_since: 1, bank_days_since: 1 } },
  async runDQ() { return { ok: true, job_run_id: 'demo-dq-1' } },
  async getFeatures() {
    const raw = localStorage.getItem('dc_features')
    if (raw) return JSON.parse(raw)
    const j = await loadState();
    const v = j.features || { flags: { reconcile: true, controls: true, flux: true, forecast: true, spend: true, treasury: true, dq: true } }
    localStorage.setItem('dc_features', JSON.stringify(v))
    return v
  },
  async setFeature(name: string, value: any) {
    const current = await this.getFeatures()
    const next = { ...current }
    if (next.flags) { next.flags[name] = value } else { next[name] = value }
    localStorage.setItem('dc_features', JSON.stringify(next))
    return next.flags ? { [name]: next.flags[name] } : { [name]: next[name] }
  },
  async listJobRuns(limit: number = 20, offset: number = 0) {
    const j = await loadState();
    return (j.job_runs || []).slice(offset, offset + limit)
  },
  async listInvoices(limit: number = 100, offset: number = 0) { const j = await loadState(); const arr = j.invoices || []; return arr.slice(offset, offset + limit) },
  async listEmployees(limit: number = 100, offset: number = 0) { const j = await loadState(); const arr = j.employees || []; return arr.slice(offset, offset + limit) },
}

export function App() { return <ConsoleView api={demoApi} /> }


