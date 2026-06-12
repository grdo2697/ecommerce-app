import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react'

const STORE_CONTEXT = `أنت مساعد ذكي لمتجر إلكتروني عراقي اسمه "متجري".
مهمتك مساعدة الزبائن في:
- الاستفسار عن المنتجات والأسعار
- تتبع الطلبات برقم التكت
- الإجابة على أسئلة التوصيل والدفع
- حل المشاكل والشكاوى
معلومات المتجر:
- الدفع: نقداً عند الاستلام فقط
- التوصيل: لجميع محافظات العراق
- ساعات العمل: 24/7 للطلبات
كن ودوداً ومختصراً. رد بالعربية دائماً.`

const AIChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'أهلاً وسهلاً! 👋 أنا مساعدك الذكي في متجري. كيف أقدر أساعدك اليوم؟' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100) }
  }, [open])

  useEffect(() => {
    if (open && !minimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, minimized])

  const sendMessage = async (customInput) => {
    const text = (customInput || input).trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 500,
          system: STORE_CONTEXT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'عذراً، حدث خطأ. تواصل معنا على الواتساب.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setUnread(prev => prev + 1)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال. تواصل معنا على الواتساب مباشرة 📱' }])
    } finally { setLoading(false) }
  }

  const quickQs = ['كيف أتابع طلبي؟', 'كم مدة التوصيل؟', 'كيف أرجع منتج؟', 'هل التوصيل مجاني؟']

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="rtl">
      {open && (
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-100 mb-4 flex flex-col transition-all ${minimized ? 'h-14 w-72 overflow-hidden' : 'w-80 sm:w-96 h-[500px]'}`}>
          <div className="bg-gradient-to-l from-primary-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Bot size={18} /></div>
              <div>
                <p className="font-bold text-sm">مساعد متجري الذكي</p>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" /> متاح 24/7
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMinimized(!minimized)} className="text-white/80 hover:text-white p-1">
                {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1"><X size={18} /></button>
            </div>
          </div>
          {!minimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-purple-100 text-purple-600'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Bot size={14} /></div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {quickQs.map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-100 border border-primary-200">
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="اكتب سؤالك هنا..." rows={1}
                  className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                  className="w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 shrink-0 self-end">
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-full shadow-lg hover:scale-105 transition-all flex items-center justify-center relative">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unread}</span>}
        {!open && <span className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />}
      </button>
    </div>
  )
}
export default AIChatWidget
