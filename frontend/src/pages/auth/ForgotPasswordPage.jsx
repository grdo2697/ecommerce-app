import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Mail size={32} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">استعادة كلمة المرور</h1>
          <p className="text-gray-500 mt-1">أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة</p>
        </div>
        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">تم الإرسال!</h3>
              <p className="text-gray-500 text-sm mb-6">إذا كان البريد مسجلاً، ستصلك رسالة خلال دقائق. تحقق من مجلد الرسائل غير المرغوب فيها.</p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowRight size={16} /> العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com" className="input-field ltr" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Mail size={18} />}
                {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary-600 hover:text-primary-800">← العودة لتسجيل الدخول</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
