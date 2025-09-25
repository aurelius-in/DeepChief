import React from 'react'
import { ConsoleView } from './ConsoleView'

const api = {
  async getWhyCard() {
    return { policy: 'CTRL_ApprovalThreshold', inputs: {}, tools_used: [], result: {}, receipt: {} }
  },
  async listGlEntries(limit: number = 100, offset: number = 0) {
    const r = await fetch(`/api/gl_entries?limit=${limit}&offset=${offset}`)
    return r.json()
  },
  async listBankTxns(limit: number = 100, offset: number = 0) {
    const r = await fetch(`/api/bank_txns?limit=${limit}&offset=${offset}`)
    return r.json()
  },
  async verifyReceipt(req: any) {
    const r = await fetch('/api/receipts/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) })
    return r.json()
  },
  async listMatches(limit: number = 100, offset: number = 0) {
    const r = await fetch(`/api/matches?limit=${limit}&offset=${offset}`)
    return r.json()
  },
  async runIngest() {
    const r = await fetch('/api/ingest/mock', { method: 'POST' })
    return r.json()
  },
  async runReconciler() {
    const r = await fetch('/api/agents/auto_reconciler/run', { method: 'POST' })
    return r.json()
  },
  async getKpiCloseToCash() {
    const r = await fetch('/api/kpi/close_to_cash')
    return r.json()
  },
  async listControlsLatest() {
    const r = await fetch('/api/controls/latest')
    return r.json()
  },
  async runControls(mode?: string) {
    const qs = mode ? `?mode=${encodeURIComponent(mode)}` : ''
    const r = await fetch(`/api/controls/run${qs}`, { method: 'POST' })
    return r.json()
  },
  async listFlux() {
    const r = await fetch('/api/flux')
    return r.json()
  },
  async runFlux() {
    const r = await fetch('/api/agents/flux/run', { method: 'POST' })
    return r.json()
  },
  async listForecast() {
    const r = await fetch('/api/forecast')
    return r.json()
  },
  async runForecast() {
    const r = await fetch('/api/agents/forecast/run', { method: 'POST' })
    return r.json()
  },
  async listExceptions() {
    const r = await fetch('/api/exceptions')
    return r.json()
  },
  async runExceptionTriage() {
    const r = await fetch('/api/agents/exception_triage/run', { method: 'POST' })
    return r.json()
  },
  async listSpend() {
    const r = await fetch('/api/spend')
    return r.json()
  },
  async runDuplicate() {
    const r = await fetch('/api/spend/duplicate/run', { method: 'POST' })
    return r.json()
  },
  async runSaas() {
    const r = await fetch('/api/spend/saas/run', { method: 'POST' })
    return r.json()
  },
  async getKpiSpend() {
    const r = await fetch('/api/kpi/spend')
    return r.json()
  },
  async getKpiTreasury() {
    const r = await fetch('/api/kpi/treasury')
    return r.json()
  },
  async listPolicies() {
    const r = await fetch('/api/policies')
    return r.json()
  },
  async verifyReceiptById(receiptId: string) {
    const r = await fetch(`/api/receipts/${encodeURIComponent(receiptId)}/verify`)
    return r.json()
  },
  async getTreasuryCash(days: number = 14) {
    const r = await fetch(`/api/treasury/cash?days=${days}`)
    return r.json()
  },
  async getKpiAudit() {
    const r = await fetch('/api/kpi/audit')
    return r.json()
  },
  async runDQ() {
    const r = await fetch('/api/agents/dq_sentinel/run', { method: 'POST' })
    return r.json()
  },
}

export function App() {
  return <ConsoleView api={api} />
}


