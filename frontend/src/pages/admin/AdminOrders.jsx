import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import { adminAPI, ordersAPI } from '../../services/api'
import toast from 'react-hot-toast'

const statusMap = {
  pending: { label: 'انتظار', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'تجهيز', color: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'شحن', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'تسليم', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'مسترجع', color: 'bg-gray-100 text-gray-600' },
}

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [updatingId, setUpdatingId] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAllOrders({ page, limit: 15, status: statusFilter || undefined })
      setOrders(res.data.data.orders)
      setPagination(res.data.data.pagination)
    } catch { toast.error('خطأ في جلب الطلبات') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page, statusFilter])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus })
      toast.success('تم تحديث حالة الطلب')
      fetch()
    } catch { toast.error('حدث خطأ') }
    finally { setUpdatingId(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">الطلبات</h1>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="input-field w-auto py-2 text-sm">
          <option value="">جميع الحالات</option>
          {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs">رقم الطلب</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">العميل</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">المبلغ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">التاريخ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}</tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">لا توجد طلبات</td></tr>
              ) : orders.map(order => {
                const s = statusMap[order.status] || statusMap.pending
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-primary-600 text-xs">#{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-xs">{order.user_name}</p>
                      <p className="text-gray-400 text-xs">{order.user_email}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${s.color}`}>{s.label}</span></td>
                    <td className="px-4 py-3 font-bold text-gray-800">${Number(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('ar')}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            <button disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">السابق</button>
            <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {pagination.totalPages}</span>
            <button disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">التالي</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
