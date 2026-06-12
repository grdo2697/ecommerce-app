import { useState, useEffect } from 'react'
import { Search, UserCheck, UserX } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [toggling, setToggling] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getUsers({ page, limit: 15, search: search || undefined })
      setUsers(res.data.data.users)
      setPagination(res.data.data.pagination)
    } catch { toast.error('خطأ في جلب المستخدمين') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page, search])

  const handleToggle = async (id) => {
    setToggling(id)
    try {
      await adminAPI.toggleUserStatus(id)
      toast.success('تم تحديث حالة المستخدم')
      fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ') }
    finally { setToggling(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">المستخدمين <span className="text-gray-400 font-normal text-lg">({pagination.total || 0})</span></h1>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="ابحث بالاسم أو البريد..." className="input-field pr-10" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs">المستخدم</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الصلاحية</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الطلبات</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">إجمالي الإنفاق</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">تاريخ التسجيل</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}</tr>
              )) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'admin' ? 'مدير' : 'عميل'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{user.orders_count}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-xs">${Number(user.total_spent || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(user.created_at).toLocaleDateString('ar')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(user.id)}
                      disabled={toggling === user.id || user.role === 'admin'}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        user.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {user.is_active ? <><UserX size={14} />تعطيل</> : <><UserCheck size={14} />تفعيل</>}
                    </button>
                  </td>
                </tr>
              ))}
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

export default AdminUsers
