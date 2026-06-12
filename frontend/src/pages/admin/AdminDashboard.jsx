import { useState, useEffect } from 'react'
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
const statusLabels = { pending: 'انتظار', confirmed: 'مؤكد', processing: 'تجهيز', shipped: 'شحن', delivered: 'تسليم', cancelled: 'ملغي' }

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('خطأ في جلب الإحصائيات'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
    </div>
  )

  if (!stats) return null

  const { sales, users, products, weeklySales, topProducts, recentOrders } = stats

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">لوحة التحكم</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { icon: DollarSign, label: 'إيرادات الشهر', value: `$${Number(sales?.total_revenue || 0).toFixed(2)}`, color: 'bg-green-100 text-green-600', change: '+12%' },
          { icon: ShoppingCart, label: 'طلبات الشهر', value: sales?.total_orders || 0, color: 'bg-blue-100 text-blue-600', change: '+8%' },
          { icon: Users, label: 'إجمالي العملاء', value: users?.total_users || 0, color: 'bg-purple-100 text-purple-600', change: `+${users?.new_this_month || 0} هذا الشهر` },
          { icon: Package, label: 'المنتجات', value: products?.total_products || 0, color: 'bg-orange-100 text-orange-600', change: `${products?.low_stock_count || 0} مخزون منخفض` },
        ].map(card => (
          <div key={card.label} className="card p-5">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-black text-gray-800 mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {products?.low_stock_count > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{products.low_stock_count}</strong> منتج بمخزون منخفض
            {products.out_of_stock_count > 0 && ` و${products.out_of_stock_count} منتج نفد مخزونه`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" />المبيعات - آخر 7 أيام</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'الإيرادات']} />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">أكثر المنتجات مبيعاً</h2>
          <div className="space-y-3">
            {topProducts?.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sold_quantity} مبيعة</p>
                </div>
                <span className="text-xs font-bold text-green-600">${Number(p.revenue || 0).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-800 mb-4">آخر الطلبات</h2>
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-right py-2 font-semibold text-gray-500 text-xs">رقم الطلب</th>
                <th className="text-right py-2 font-semibold text-gray-500 text-xs">العميل</th>
                <th className="text-right py-2 font-semibold text-gray-500 text-xs">الحالة</th>
                <th className="text-right py-2 font-semibold text-gray-500 text-xs">المبلغ</th>
                <th className="text-right py-2 font-semibold text-gray-500 text-xs">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-primary-600">#{order.order_number}</td>
                  <td className="py-3 text-gray-700">{order.user_name}</td>
                  <td className="py-3">
                    <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-gray-800">${Number(order.total).toFixed(2)}</td>
                  <td className="py-3 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('ar')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
