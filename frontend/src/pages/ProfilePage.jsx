import { useState } from 'react'
import { User, Lock, Camera } from 'lucide-react'
import { usersAPI, uploadAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' })
  const [loading, setLoading] = useState(false)

  const handleProfileUpdate = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await usersAPI.updateProfile(profile)
      updateUser(profile)
      toast.success('تم تحديث الملف الشخصي')
    } catch { toast.error('حدث خطأ') } finally { setLoading(false) }
  }

  const handlePasswordChange = async e => {
    e.preventDefault()
    if (passwords.new_password.length < 8) { toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    setLoading(true)
    try {
      await usersAPI.changePassword(passwords)
      toast.success('تم تغيير كلمة المرور')
      setPasswords({ current_password: '', new_password: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ') } finally { setLoading(false) }
  }

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const res = await uploadAPI.avatar(fd)
      updateUser({ avatar: res.data.data.url })
      toast.success('تم تحديث الصورة الشخصية')
    } catch { toast.error('فشل رفع الصورة') }
  }

  return (
    <div className="container-app py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">الملف الشخصي</h1>

      {/* Avatar */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="relative">
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
            : <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-bold">{user?.name?.charAt(0)}</div>
          }
          <label className="absolute bottom-0 left-0 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
            <Camera size={14} />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {user?.role === 'admin' ? 'مدير' : 'عميل'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[{ k: 'profile', label: 'المعلومات', icon: User }, { k: 'password', label: 'كلمة المرور', icon: Lock }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.k ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {tab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input value={user?.email} disabled className="input-field bg-gray-50 text-gray-500 cursor-not-allowed ltr" />
              <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="input-field ltr" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
              <input type="password" value={passwords.current_password} onChange={e => setPasswords({...passwords, current_password: e.target.value})} className="input-field ltr" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
              <input type="password" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} className="input-field ltr" required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
