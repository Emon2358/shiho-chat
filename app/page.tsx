"use client"
import { useState, useRef } from 'react'

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [prompt, setPrompt] = useState('') // 任意プロンプト
  const container = useRef<HTMLDivElement>(null)

  const addMessage = (role: string, content: string) =>
    setMessages(old => [...old, { role, content }])

  const send = async () => {
    if (!input) return
    addMessage('user', input)
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, prompt })
    })
    const reader = resp.body!.getReader()
    let aiMsg = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = new TextDecoder().decode(value)
      aiMsg += chunk
      // ストリーミングで表示
      const partial = aiMsg
      setMessages(old => {
        const copy = [...old]
        copy.push({ role: 'assistant', content: partial })
        return copy
      })
    }
    setInput('')
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <img src="/shiho.png" alt="しほアイコン" width={64} height={64} />
      <h1>しほとおしゃべり</h1>
      <textarea
        placeholder="システムプロンプト（例：「あなたは●●です」）"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        style={{ width: '100%', height: 60 }}
      />
      <div ref={container} style={{ border: '1px solid #ccc', height: 400, overflowY: 'auto', padding: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <strong>{m.role === 'user' ? 'You' : 'しほ'}:</strong> {m.content}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <input
          type="text"
          placeholder="メッセージ入力"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ width: '80%' }}
        />
        <button onClick={send}>送信</button>
      </div>
    </div>
  )
}
