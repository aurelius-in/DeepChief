import React, { useMemo } from 'react'
import { JsonView, darkStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

const headingFont = new FontFace('DCWordmark', 'url(/wordmark_dc.png)')
headingFont.load().then(() => {
  document.fonts.add(headingFont)
})

const colors = {
  bg: '#0b1321',
  panel: '#121b2e',
  text: '#e6edf6',
  accent: '#57a6ff',
}

export function App() {
  const sample = useMemo(() => ({
    policy: 'CTRL_ApprovalThreshold',
    inputs: { je_id: 'JE123', amount_abs: 30000 },
    tools_used: ['rule-engine'],
    result: { flag: 'approval_required' },
    receipt: { id: 'demo', verify: true },
  }), [])

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text }}>
      <header style={{ padding: 16, borderBottom: `1px solid ${colors.panel}` }}>
        <h1 style={{ fontFamily: 'DCWordmark, system-ui', margin: 0 }}>DeepChief Console</h1>
      </header>
      <main style={{ maxWidth: 1200, margin: '24px auto', padding: '0 16px' }}>
        <section style={{ background: colors.panel, padding: 16, borderRadius: 8 }}>
          <h2 style={{ marginTop: 0 }}>Why Card</h2>
          <JsonView data={sample} style={darkStyles} />
        </section>
      </main>
    </div>
  )
}


