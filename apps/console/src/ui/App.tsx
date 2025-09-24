import React from 'react'
import { ConsoleView } from './ConsoleView'

const api = {
  async getWhyCard() {
    return { policy: 'CTRL_ApprovalThreshold', inputs: {}, tools_used: [], result: {}, receipt: {} }
  },
  async listGlEntries() {
    const r = await fetch('/api/gl_entries')
    return r.json()
  },
  async listBankTxns() {
    const r = await fetch('/api/bank_txns')
    return r.json()
  },
  async verifyReceipt(req: any) {
    const r = await fetch('/api/receipts/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) })
    return r.json()
  },
  async listMatches() {
    const r = await fetch('/api/matches')
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
}

export function App() {
  return <ConsoleView api={api} />
}


