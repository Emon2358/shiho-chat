// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [prompt, setPrompt] = useState('');
  const container = useRef<HTMLDivElement>(null);

  const addMessage = (role: string, content: string) =>
    setMessages(old => [...old, { role, content }]);

  useEffect(() => {
    // 新しいメッセージが追加されたらスクロール
    if (container.current) {
      container.current.scrollTop = container.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input) return;
    addMessage('user', input);
    setInput('');
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, prompt })
    });
    const reader = resp.body!.getReader();
    let aiMsg = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      aiMsg += chunk;
      setMessages(old => {
        const withoutLast = old.filter((_, i) => i < old.length - 1 || old[old.length - 1].role !== 'assistant');
        return [...withoutLast, { role: 'assistant', content: aiMsg }];
      });
    }
  };

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
      <div
        ref={container}
        style={{ border: '1px solid #ccc', height: 400, overflowY: 'auto', padding: 8, marginTop: 8 }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left', margin: '4px 0' }}>
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
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} style={{ marginLeft: 8 }}>送信</button>
      </div>
    </div>
  );
}
