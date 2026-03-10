'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED = [
  'Do I qualify for CalFresh if I work part-time?',
  'Can undocumented parents apply for benefits for their US-born children?',
  'How long does a Medi-Cal application take?',
  'What documents do I need to apply for WIC?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation_history: messages }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages((m) => [...m, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const { content } = JSON.parse(line.replace('data: ', ''));
              assistantContent += content;
              setMessages((m) => [
                ...m.slice(0, -1),
                { role: 'assistant', content: assistantContent },
              ]);
            } catch {}
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Benefits Assistant</h1>

      {messages.length === 0 && (
        <div className="mb-6">
          <p className="mb-3 text-sm text-gray-500">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'ml-auto bg-brand-600 text-white'
                : 'bg-white text-gray-800 shadow-sm'
            }`}
          >
            {msg.content || (
              <span className="animate-pulse text-gray-400">Thinking…</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any benefit program…"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-600 focus:outline-none"
          disabled={isLoading}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-primary px-5"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </main>
  );
}
