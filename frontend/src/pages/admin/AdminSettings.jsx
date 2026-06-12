import { useState } from 'react'
import { Save, Store, Phone, Mail, MapPin, Facebook, Instagram, MessageCircle, Tag, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('store')
  const [loading, setLoading] = useState(false)

  // بيانات المتجر
  const [storeInfo, setStoreInfo] = useState({
    name: 'متجري',
    phone: '+964 770 000 0000',
    email: 'info@mystore.iq',
    address: 'بغداد، العراق',
    facebook: 'https://facebook.com/mystore',
    instagram: 'https://instagram.com/mystore',
    whatsapp: 'https://wa.me/9647700000000',
  })

  // كوبونات الخصم
  const [coupons, setCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'percentage', value: '', min_order: '0', max_uses: ''
  })

  const fetchCoupons = async () => {
    setLoadingCoupons(true)
    try {
      const res = await api.get('/admin/coupons')
      setCoupons(res.data.data.coupons)
    } catch {
      // silent
    } finally {
      setLoadingCoupons(false)
    }
  }

  const handleStoreInfoSave = async e => {
    e.preventDefault()
    setLoading(true)
    // في الموقع الحقيقي تحفظ في قاعدة البيانات
    // الحين نحفظها في localStorage مؤقتاً
    localStorage.setItem('storeInfo', JSON.stringify(storeInfo))
    await new Promise(r => setTimeout(r, 800))
    toast.success('تم حفظ بيانات المتجر ✅\nعدّل ملف Footer.jsx لتطبيقها على الموقع')
    setLoading(false)
  }

  const handleAddCoupon = async e => {
    e.preventDefault()
    if (!newCoupon.code || !newCoupon.value) {
      toast.error('كود الخصم والقيمة مطلوبة')
      return
    }
    try {
      await api.post('/admin/coupons', {
        ...newCoupon,
        value: parseFloat(newCoupon.value),
        min_order: parseFloat(newCoupon.min_order) || 0,
        max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
      })
      toast.success('تم إضافة كود الخصم')
      setNewCoupon({ code: '', type: 'percentage', value: '', min_order: '0', max_uses: '' })
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ')
    }
  }

  const tabs = [
    { key: 'store', label: 'بيانات المتجر', icon: Store },
    { key: 'coupons', label: 'كوبونات الخصم', icon: Tag },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">إعدادات المتجر</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); if (t.key === 'coupons') fetchCoupons() }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Store Info Tab */}
      {activeTab === 'store' && (
        <form onSubmit={handleStoreInfoSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2"><Store size={16} className="text-primary-600" />معلومات أساسية</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
                <input value={storeInfo.name} onChange={e => setStoreInfo({...storeInfo, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><Phone size={13} className="inline ml-1" />رقم الهاتف / واتساب</label>
                <input value={storeInfo.phone} onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})} className="input-field ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><Mail size={13} className="inline ml-1" />البريد الإلكتروني</label>
                <input type="email" value={storeInfo.email} onChange={e => setStoreInfo({...storeInfo, email: e.target.value})} className="input-field ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><MapPin size={13} className="inline ml-1" />العنوان</label>
                <input value={storeInfo.address} onChange={e => setStoreInfo({...storeInfo, address: e.target.value})} className="input-field" />
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-gray-700 mb-2">روابط السوشيال ميديا</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><Facebook size={13} className="inline ml-1 text-blue-600" />رابط فيسبوك</label>
                <input value={storeInfo.facebook} onChange={e => setStoreInfo({...storeInfo, facebook: e.target.value})} className="input-field ltr" placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><Instagram size={13} className="inline ml-1 text-pink-600" />رابط انستغرام</label>
                <input value={storeInfo.instagram} onChange={e => setStoreInfo({...storeInfo, instagram: e.target.value})} className="input-field ltr" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><MessageCircle size={13} className="inline ml-1 text-green-600" />رابط واتساب</label>
                <input value={storeInfo.whatsapp} onChange={e => setStoreInfo({...storeInfo, whatsapp: e.target.value})} className="input-field ltr" placeholder="https://wa.me/964..." />
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>ملاحظة:</strong> بعد الحفظ، افتح ملف <code className="bg-amber-100 px-1 rounded">frontend/src/components/layout/Footer.jsx</code> وعدّل المتغير <code className="bg-amber-100 px-1 rounded">STORE_INFO</code> بنفس البيانات لتظهر على الموقع.
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-4 flex items-center gap-2">
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
            {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </form>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          {/* Add Coupon */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Plus size={16} className="text-primary-600" />إضافة كود خصم جديد</h3>
            <form onSubmit={handleAddCoupon} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">كود الخصم *</label>
                <input value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  placeholder="SUMMER20" className="input-field ltr uppercase" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">نوع الخصم</label>
                <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value})} className="input-field">
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">قيمة الخصم *</label>
                <input type="number" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: e.target.value})}
                  placeholder={newCoupon.type === 'percentage' ? '10 (= 10%)' : '5 (= $5)'} className="input-field ltr" required min="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">الحد الأدنى للطلب ($)</label>
                <input type="number" value={newCoupon.min_order} onChange={e => setNewCoupon({...newCoupon, min_order: e.target.value})}
                  placeholder="0" className="input-field ltr" min="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">أقصى عدد استخدامات</label>
                <input type="number" value={newCoupon.max_uses} onChange={e => setNewCoupon({...newCoupon, max_uses: e.target.value})}
                  placeholder="بلا حد" className="input-field ltr" min="1" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Plus size={16} /> إضافة
                </button>
              </div>
            </form>
          </div>

          {/* Coupons List */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-700">الكوبونات الحالية</h3>
            </div>
            {loadingCoupons ? (
              <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
            ) : coupons.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Tag size={32} className="mx-auto mb-2 opacity-30" />
                <p>لا توجد كوبونات</p>
                <p className="text-xs mt-1">الكوبونات الافتراضية: WELCOME10 · SAVE20 · FLAT50</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">الكود</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">الخصم</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">الحد الأدنى</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">الاستخدامات</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coupons.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-primary-600">{c.code}</td>
                      <td className="px-4 py-3">{c.value}{c.type === 'percentage' ? '%' : '$'}</td>
                      <td className="px-4 py-3">${c.min_order}</td>
                      <td className="px-4 py-3">{c.used_count} / {c.max_uses || '∞'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {c.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettings
