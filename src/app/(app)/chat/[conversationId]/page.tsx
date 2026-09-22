'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  body: string
  senderId: string
  createdAt: string
  sender: { id?: string; name: string; avatarPath?: string | null }
}

interface SessionUser {
  userId: string
  name: string
}

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [user, setUser] = useState<SessionUser | null>(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setUser)
  }, [])

  useEffect(() => {
    const es = new EventSource(`/api/messages/${conversationId}/stream`)
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'init') setMessages(data.messages)
      if (data.type === 'messages') setMessages(prev => [...prev, ...data.messages])
    }
    return () => es.close()
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!body.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })
      if (res.ok) {
        const newMsg = await res.json()
        setMessages((prev) => [...prev, newMsg])
        setBody('')
        inputRef.current?.focus()
      }
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function formatTime(dateStr: string) {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const other = messages.find((m) => m.senderId !== user?.userId)?.sender

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-t-xl border border-slate-100 shadow-sm px-6 py-4 flex items-center gap-4">
        <Link href="/chat" className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        {other ? (
          <>
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {other.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{other.name}</div>
              <div className="text-xs text-green-500">En ligne</div>
            </div>
          </>
        ) : (
          <div className="font-semibold text-slate-900">Conversation</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-4 space-y-3 border-x border-slate-100">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8">
            Commencez la conversation !
          </div>
        )}
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === user?.userId
          const showName = !isOwn && (idx === 0 || messages[idx - 1].senderId !== msg.senderId)
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {showName && (
                  <span className="text-xs text-slate-400 ml-1">{msg.sender.name}</span>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-900 border border-slate-100 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.body}
                </div>
                <span className="text-xs text-slate-300 mx-1">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-b-xl border border-slate-100 shadow-sm px-4 py-3 flex gap-3 items-end">
        <textarea
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Votre message... (Entrée pour envoyer)"
          className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32 overflow-y-auto"
          style={{ minHeight: '44px' }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !body.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
