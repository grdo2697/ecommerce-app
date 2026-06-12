import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Store } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      const { token, user } = res.data.data
      login(user, token)
      toast.success(`مرحباً ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else toast.error(data?.message || 'بيانات الدخول غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Store size={32} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h1>
          <p className="text-gray-500 mt-1">أهلاً بعودتك! سجّل دخولك للمتابعة</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="example@email.com" className={`input-field ltr ${errors.email ? 'border-red-400' : ''}`} required />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="••••••••"
                  className={`input-field ltr pr-10 ${errors.password ? 'border-red-400' : ''}`} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <LogIn size={18} />}
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-800">إنشاء حساب جديد</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 space-y-1">
            <p className="font-semibold">بيانات تجريبية:</p>
            <p>مدير: admin@store.com | Admin@123</p>
            <p>مستخدم: user@test.com | User@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
