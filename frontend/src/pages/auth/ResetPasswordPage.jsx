import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const handleSubmit = async e => {
    e.preventDefault()
    if (!token) { toast.error('رابط غير صالح'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword({ token, password })
      toast.success('تم تغيير كلمة المرور بنجاح!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ، الرابط منتهي الصلاحية')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Lock size={32} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">تعيين كلمة مرور جديدة</h1>
        </div>
        <div className="card p-8">
          {!token ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">رابط غير صالح أو منتهي الصلاحية</p>
              <Link to="/forgot-password" className="btn-primary inline-block">طلب رابط جديد</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="8 أحرف على الأقل"
                    className="input-field ltr pr-10" required minLength={8} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Lock size={18} />}
                {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
