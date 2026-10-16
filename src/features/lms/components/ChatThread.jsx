import { useState, useRef, useEffect } from 'react'
import { Send, Smile } from '@/shared/components/Icons'

const EMOJIS = ['😀', '😂', '🙂', '👍', '🙌', '🎉', '❤️', '🔥', '✅', '❓', '📌', '📎', '⏰', '🙏', '👏', '💡']

export default function ChatThread({ messages, currentUserId, onSend, emptyText = 'Todavía no hay mensajes — escribe el primero.' }) {
  const [body, setBody] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const bottomRef = useRef(null)
  const pickerRef = useRef(null)

  useEffect(() => {
    if (!pickerOpen) return
    function handleClick(e) {
      if (!pickerRef.current?.contains(e.target)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [pickerOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length])

  function handleSend() {
    if (!body.trim()) return
    onSend(body.trim())
    setBody('')
  }

  return (
    <div className="flex flex-col" style={{ height: 420 }}>
      <div className="flex-1 overflow-y-auto rounded-xl p-3 mb-3 space-y-2" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
        {messages.length === 0 && (
          <p className="text-xs text-center py-8" style={{ color: 'var(--muted-foreground)' }}>{emptyText}</p>
        )}
        {messages.map(m => {
          const mine = m.fromId === currentUserId
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <div className="max-w-[75%] px-3 py-2 rounded-xl text-sm wrap-break-word"
                style={{
                  backgroundColor: mine ? '#005187' : 'var(--card)',
                  color: mine ? 'white' : 'var(--foreground)',
                  border: mine ? 'none' : '1px solid var(--border)',
                }}>
                <p>{m.body}</p>
                <p className="text-xs mt-1" style={{ color: mine ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)' }}>
                  {new Date(m.createdAt).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 items-end relative" ref={pickerRef}>
        {pickerOpen && (
          <div className="grid grid-cols-8 gap-1 p-2 rounded-xl shadow-lg"
            style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, backgroundColor: 'var(--card)', border: '1px solid var(--border)', zIndex: 10 }}>
            {EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => { setBody(b => b + e); setPickerOpen(false) }}
                className="text-lg w-8 h-8 rounded-lg transition-colors hover:opacity-70"
                style={{ backgroundColor: 'var(--muted)' }}>
                {e}
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setPickerOpen(o => !o)}
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }} title="Emojis">
          <Smile size={16} />
        </button>
        <textarea rows={2} value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Escribe un mensaje…"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        <button onClick={handleSend} disabled={!body.trim()}
          className="px-3 rounded-lg text-white flex items-center justify-center shrink-0 disabled:opacity-50"
          style={{ backgroundColor: '#005187', height: 36 }} title="Enviar">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
