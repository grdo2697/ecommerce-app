import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Store } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
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
      const res = await authAPI.register(form)
      const { token, user } = res.data.data
      login(user, token)
      toast.success('تم إنشاء الحساب بنجاح! 🎉')
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else toast.error(data?.message || 'حدث خطأ في إنشاء الحساب')
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
          <h1 className="text-2xl font-bold text-gray-800">إنشاء حساب جديد</h1>
          <p className="text-gray-500 mt-1">انضم إلينا واستمتع بتجربة تسوق مميزة</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="أحمد محمد" className={`input-field ${errors.name ? 'border-red-400' : ''}`} required />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="example@email.com" className={`input-field ltr ${errors.email ? 'border-red-400' : ''}`} required />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                placeholder="+966500000000" className="input-field ltr" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="8 أحرف على الأقل"
                  className={`input-field ltr pr-10 ${errors.password ? 'border-red-400' : ''}`} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-400 mt-1">يجب أن تحتوي على حرف كبير وصغير ورقم</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <UserPlus size={18} />}
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            لديك حساب؟{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-800">تسجيل الدخول</Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400">
            بالتسجيل أنت توافق على{' '}
            <Link to="/terms" className="text-primary-600">الشروط والأحكام</Link>
            {' '}و{' '}
            <Link to="/privacy" className="text-primary-600">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
