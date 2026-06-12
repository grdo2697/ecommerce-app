import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Eye } from 'lucide-react'
import { ordersAPI } from '../services/api'
import toast from 'react-hot-toast'

const statusMap = {
  pending: { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'قيد التجهيز', color: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'تم الشحن', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'مسترجع', color: 'bg-gray-100 text-gray-700' },
}

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersAPI.getAll()
      .then(res => setOrders(res.data.data.orders))
      .catch(() => toast.error('خطأ في جلب الطلبات'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container-app py-10 text-center text-gray-400">جاري التحميل...</div>

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Package size={24} className="text-primary-600" /> طلباتي</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد طلبات بعد</h3>
          <Link to="/products" className="btn-primary inline-block mt-4">تسوق الآن</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = statusMap[order.status] || statusMap.pending
            return (
              <div key={order.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-800">#{order.order_number}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString('ar')} · {order.items_count} منتج</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${status.color}`}>{status.label}</span>
                  <span className="font-bold text-primary-600">${Number(order.total).toFixed(2)}</span>
                  <Link to={`/orders/${order.id}`} className="btn-secondary py-2 px-3 flex items-center gap-1 text-sm">
                    <Eye size={14} /> التفاصيل
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
