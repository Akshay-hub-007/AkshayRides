'use client'
import { chatbot } from '@/actions/chatbot'
import { useState, useRef, useEffect } from 'react'


function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    // Example: { from: 'bot', text: 'Ask me anything about cars!' }
  ])
  const messagesEndRef = useRef(null)

  const handleChat = async () => {
    if (!query.trim()) return
    setLoading(true)
    setMessages((prev) => [...prev, { from: 'user', text: query }])
    setQuery('')
    setMessages((prev) => [...prev, { from: 'bot', text: '___LOADING___' }])
    try {
      const res = await chatbot(query)
      setMessages((prev) => {
        const msgs = prev.slice(0, -1)
        return [
          ...msgs,
          { from: 'bot', text: res?.reply || res || 'No response' }
        ]
      })
    } catch (e) {
      setMessages((prev) => {
        const msgs = prev.slice(0, -1)
        return [
          ...msgs,
          { from: 'bot', text: 'Sorry, something went wrong.' }
        ]
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-2xl rounded-2xl w-80 h-[34rem] p-0 border border-blue-200 flex flex-col animate-fade-in">
          <div className="flex justify-between items-center px-4 py-3 border-b border-blue-100 rounded-t-2xl bg-blue-600">
            <h4 className="font-bold text-white tracking-wide text-lg flex items-center gap-2">
              <span className="bg-white/20 rounded-full px-2 py-1 text-xs mr-2">AI</span> Chatbot
            </h4>
            <button onClick={() => setIsOpen(false)} className="text-white text-xl hover:text-blue-200 transition">&times;</button>
          </div>
          <div className="relative flex-1 min-h-[300px] max-h-[25rem] overflow-y-auto text-sm px-4 py-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat rounded-b-xl" style={{backgroundBlendMode:'lighten'}}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-20 text-blue-700 font-extrabold text-2xl tracking-widest" style={{zIndex:0}}>
              AkshayRides AI
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              {messages.length === 0 && (
                <div className="text-blue-700 text-center font-medium mt-8 animate-pulse">Ask me anything about cars!</div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.from === 'user'
                      ? 'flex justify-end'
                      : 'flex justify-start'
                  }
                >
                  <span
                    className={
                      msg.from === 'user'
                        ? 'bg-blue-600 text-white rounded-lg px-3 py-2 max-w-[80%] shadow font-medium'
                        : 'bg-white/80 text-gray-800 rounded-lg px-3 py-2 max-w-[80%] shadow'
                    }
                  >
                    {msg.text === '___LOADING___' ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="dot-flashing"></span>
                        <span className="dot-flashing"></span>
                        <span className="dot-flashing"></span>
                      </span>
                    ) : msg.text}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
      <style>{`
        .dot-flashing {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 1px;
          border-radius: 50%;
          background: #2563eb;
          animation: dotFlashing 1s infinite linear alternate;
        }
        .dot-flashing:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot-flashing:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes dotFlashing {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
          </div>
          <div className="p-4 border-t border-blue-100 bg-white rounded-b-2xl flex gap-2">
            <input
              type="text"
              placeholder="Type your question..."
              className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleChat() }}
              disabled={loading}
              autoFocus
            />
            <button
              onClick={handleChat}
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg font-semibold text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <span className="animate-spin">⏳</span> : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-5 rounded-full shadow-2xl hover:scale-110 hover:shadow-blue-300 transition-all duration-200 border-4 border-white flex items-center justify-center text-3xl animate-bounce"
          aria-label="Open chatbot"
        >
          💬
        </button>
      )}
    </div>
  )
}

export default ChatbotWidget