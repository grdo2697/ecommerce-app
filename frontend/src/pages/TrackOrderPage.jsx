import { useState } from 'react'
import { Search, Package, CheckCircle, Truck, Clock, XCircle, MapPin } from 'lucide-react'
import api from '../services/api'

const steps = [
  { status: 'pending',    label: 'تم استلام الطلب',  icon: Clock,        color: 'text-yellow-500' },
  { status: 'confirmed',  label: 'تم تأكيد الطلب',   icon: CheckCircle,  color: 'text-blue-500' },
  { status: 'processing', label: 'جاري التجهيز',      icon: Package,      color: 'text-purple-500' },
  { status: 'shipped',    label: 'في الطريق إليك',    icon: Truck,        color: 'text-indigo-500' },
  { status: 'delivered',  label: 'تم التسليم ✅',     icon: CheckCircle,  color: 'text-green-500' },
]

const statusOrder = { pending:0, confirmed:1, processing:2, shipped:3, delivered:4 }

const TrackOrderPage = () => {
  const [ticketNum, setTicketNum] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async e => {
    e.preventDefault()
    if (!ticketNum.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await api.get(`/orders/track/${ticketNum.toUpperCase().trim()}`)
      setOrder(res.data.data.order)
    } catch {
      setError('لم يتم العثور على الطلب. تأكد من رقم التكت')
    } finally { setLoading(false) }
  }

  const currentStep = order ? (statusOrder[order.status] ?? 0) : -1

  return (
    <div className="container-app py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package size={32} className="text-primary-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-800 mb-2">تتبع طلبك</h1>
        <p className="text-gray-500">أدخل رقم التكت الخاص بطلبك لمعرفة حالته</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          value={ticketNum}
          onChange={e => setTicketNum(e.target.value.toUpperCase())}
          placeholder="مثال: FO0001"
          className="input-field flex-1 text-center text-lg font-bold ltr tracking-widest"
        />
        <button type="submit" disabled={loading} className="btn-primary px-6 flex items-center gap-2">
          {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Search size={18} />}
          بحث
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-600 flex items-center justify-center gap-2">
          <XCircle size={20} /> {error}
        </div>
      )}

      {order && (
        <div className="space-y-5 animate-fade-in">
          {/* Order Info */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-2xl text-primary-600 tracking-wider">{order.order_number}</h2>
              <span className={`badge ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {steps.find(s => s.status === order.status)?.label || order.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">تاريخ الطلب</p>
                <p className="font-semibold text-gray-800">{new Date(order.created_at).toLocaleDateString('ar-IQ')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">المبلغ الكلي</p>
                <p className="font-semibold text-primary-600">{(order.total * 1300).toLocaleString('ar-IQ')} د.ع</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {order.status !== 'cancelled' && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-5">مراحل الطلب</h3>
              <div className="space-y-4">
                {steps.map((step, i) => {
                  const done = i <= currentStep
                  const active = i === currentStep
                  return (
                    <div key={step.status} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'} ${active ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}>
                        <step.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                        {active && <p className="text-xs text-primary-600 mt-0.5 animate-pulse">الحالة الحالية</p>}
                      </div>
                      {done && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-primary-600" /> عنوان التوصيل
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-800">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.phone}</p>
                <p>{order.shipping_address.city}، {order.shipping_address.country}</p>
                <p>{order.shipping_address.address}</p>
              </div>
            </div>
          )}

          {/* Items */}
          {order.items?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-3">المنتجات</h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.product_image || '/placeholder-product.png'} alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-800 text-sm">
                      {(item.total_price * 1300).toLocaleString('ar-IQ')} د.ع
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default TrackOrderPage
