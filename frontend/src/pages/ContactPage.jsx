import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000)) // simulate send
    toast.success('تم إرسال رسالتك! سنرد عليك خلال 24 ساعة')
    setForm({ name: '', email: '', subject: '', message: '' })
    setLoading(false)
  }

  return (
    <div className="container-app py-14 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-800 mb-3">تواصل معنا</h1>
        <p className="text-gray-500">نحن هنا للمساعدة! أرسل لنا رسالتك وسنرد في أقرب وقت</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-5">
          {[
            { icon: Mail, title: 'البريد الإلكتروني', value: 'support@mystore.com', color: 'bg-blue-100 text-blue-600' },
            { icon: Phone, title: 'الهاتف', value: '+966 50 000 0000', color: 'bg-green-100 text-green-600' },
            { icon: MapPin, title: 'العنوان', value: 'الرياض، المملكة العربية السعودية', color: 'bg-purple-100 text-purple-600' },
          ].map(item => (
            <div key={item.title} className="card p-4 flex items-start gap-4">
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                <item.icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">{item.title}</p>
                <p className="text-gray-500 text-sm mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
          <div className="card p-4 bg-primary-50 border border-primary-100">
            <p className="text-sm font-semibold text-primary-700 mb-1">ساعات العمل</p>
            <p className="text-xs text-primary-600">السبت - الخميس: 9 صباحاً - 9 مساءً</p>
            <p className="text-xs text-primary-600">الجمعة: 2 ظهراً - 9 مساءً</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field ltr" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع</label>
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} className="input-field resize-none" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Send size={16} />}
                {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
