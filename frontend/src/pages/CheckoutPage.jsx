import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, ShoppingBag, Tag, ArrowRight, Phone, User, Home } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { ordersAPI } from '../services/api'
import { formatIQD, validateIraqiPhone } from '../utils/currency'
import toast from 'react-hot-toast'

const IRAQ_CITIES = ['بغداد','البصرة','نينوى','أربيل','النجف','كربلاء','الأنبار',
  'ذي قار','ديالى','بابل','واسط','المثنى','القادسية','صلاح الدين',
  'كركوك','ميسان','السليمانية','دهوك']

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCartStore()
  const navigate = useNavigate()
  const total = getTotal()
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  const [address, setAddress] = useState({
    full_name: '', phone: '', country: 'العراق',
    city: '', address: '', notes: ''
  })

  const handleSubmit = async e => {
    e.preventDefault()

    // التحقق من رقم الهاتف العراقي
    if (!validateIraqiPhone(address.phone)) {
      toast.error('رقم الهاتف غير صحيح - يجب أن يبدأ بـ 07 ويكون 11 رقم')
      return
    }

    setLoading(true)
    try {
      const res = await ordersAPI.create({
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        shipping_address: address,
        payment_method: 'cash_on_delivery',
        coupon_code: couponCode || undefined,
        notes: address.notes || ''
      })
      const { orderNumber, total: finalTotal, discount } = res.data.data
      clearCart()
      toast.success('تم إرسال طلبك بنجاح! 🎉')
      navigate(`/order-success?order=${orderNumber}&total=${finalTotal}&discount=${discount || 0}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) { navigate('/cart'); return null }

  return (
    <div className="container-app py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">الرئيسية</Link>
        <ArrowRight size={14} />
        <Link to="/cart" className="hover:text-primary-600">السلة</Link>
        <ArrowRight size={14} />
        <span className="text-gray-800 font-medium">إتمام الطلب</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">إتمام الطلب</h1>

      {/* COD Badge */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">💵</div>
        <div>
          <p className="font-bold text-green-800">الدفع عند الاستلام</p>
          <p className="text-sm text-green-600">ادفع كاش لما يوصلك الطلب - بدون بطاقة أو دفع مسبق</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" /> بيانات التوصيل
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User size={13} className="inline ml-1" />الاسم الكامل *
                    </label>
                    <input value={address.full_name}
                      onChange={e => setAddress({...address, full_name: e.target.value})}
                      placeholder="اسمك الكامل" className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone size={13} className="inline ml-1" />رقم الهاتف * (07XXXXXXXXX)
                    </label>
                    <input value={address.phone}
                      onChange={e => setAddress({...address, phone: e.target.value})}
                      placeholder="07X XXX XXXX" className="input-field ltr"
                      maxLength={11} required />
                    {address.phone && !validateIraqiPhone(address.phone) && (
                      <p className="text-xs text-red-500 mt-1">رقم غير صحيح - يبدأ بـ 07 ويكون 11 رقم</p>
                    )}
                    {address.phone && validateIraqiPhone(address.phone) && (
                      <p className="text-xs text-green-600 mt-1">✅ رقم صحيح</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الدولة</label>
                    <input value={address.country}
                      onChange={e => setAddress({...address, country: e.target.value})}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة *</label>
                    <select value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      className="input-field" required>
                      <option value="">اختر المحافظة</option>
                      {IRAQ_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Home size={13} className="inline ml-1" />العنوان التفصيلي *
                  </label>
                  <textarea value={address.address}
                    onChange={e => setAddress({...address, address: e.target.value})}
                    placeholder="الحي، الشارع، رقم البيت..."
                    rows={3} className="input-field resize-none" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات للتوصيل (اختياري)</label>
                  <textarea value={address.notes}
                    onChange={e => setAddress({...address, notes: e.target.value})}
                    placeholder="أي تعليمات خاصة..."
                    rows={2} className="input-field resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-5 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-primary-600" /> ملخص الطلب
              </h3>

              <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.thumbnail || '/placeholder-product.png'} alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-50"
                      onError={e => { e.target.src = '/placeholder-product.png' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 line-clamp-1 font-medium">{item.name_ar || item.name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800">
                      {formatIQD((item.sale_price || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <Tag size={12} className="inline ml-1" />كود الخصم
                </label>
                <input value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME10" className="input-field py-2 text-sm ltr" />
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع</span>
                  <span>{formatIQD(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span className="text-green-600 font-medium">مجاني 🎁</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2">
                  <span>الإجمالي</span>
                  <span className="text-primary-600">{formatIQD(total)}</span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3">
                {loading
                  ? <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> جاري الإرسال...</>
                  : <><ShoppingBag size={20} /> تأكيد الطلب</>
                }
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">💵 الدفع نقداً عند الاستلام</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CheckoutPage
