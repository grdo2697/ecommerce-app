import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ordersAPI } from '../services/api'
import toast from 'react-hot-toast'

const statusMap = {
  pending: 'في الانتظار', confirmed: 'مؤكد', processing: 'قيد التجهيز',
  shipped: 'تم الشحن', delivered: 'تم التسليم', cancelled: 'ملغي', refunded: 'مسترجع'
}
const payStatusMap = { pending: 'معلق', paid: 'مدفوع', failed: 'فاشل', refunded: 'مسترجع' }

const OrderDetailPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersAPI.getOne(id)
      .then(res => setOrder(res.data.data.order))
      .catch(() => toast.error('خطأ في جلب الطلب'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container-app py-10 text-center text-gray-400">جاري التحميل...</div>
  if (!order) return <div className="container-app py-10 text-center text-gray-500">الطلب غير موجود</div>

  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address

  return (
    <div className="container-app py-8 max-w-3xl mx-auto">
      <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-5">
        <ArrowRight size={14} /> العودة للطلبات
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">طلب #{order.order_number}</h1>
        <div className="flex gap-2">
          <span className="badge bg-blue-100 text-blue-700">{statusMap[order.status]}</span>
          <span className={`badge ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{payStatusMap[order.payment_status]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">عنوان الشحن</h3>
          <p className="text-sm text-gray-600">{addr?.full_name}</p>
          <p className="text-sm text-gray-600">{addr?.phone}</p>
          <p className="text-sm text-gray-600">{addr?.address}</p>
          <p className="text-sm text-gray-600">{addr?.city}، {addr?.country}</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">ملخص الدفع</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between"><span>المجموع الفرعي</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>الخصم</span><span>-${Number(order.discount).toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>الشحن</span><span>مجاني</span></div>
            <div className="flex justify-between font-bold text-gray-800 border-t pt-1"><span>الإجمالي</span><span className="text-primary-600">${Number(order.total).toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-700 mb-4">المنتجات</h3>
        <div className="space-y-4">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center gap-4">
              <img src={item.product_image || '/placeholder-product.png'} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover" onError={e => { e.target.src = '/placeholder-product.png' }} />
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-400">x{item.quantity} · ${Number(item.unit_price).toFixed(2)} للقطعة</p>
              </div>
              <span className="font-bold text-gray-800">${Number(item.total_price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
