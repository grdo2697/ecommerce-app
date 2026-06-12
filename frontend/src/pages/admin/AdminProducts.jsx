import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react'
import { productsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [deleting, setDeleting] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productsAPI.getAll({ page, limit: 15, search: search || undefined })
      setProducts(res.data.data.products)
      setPagination(res.data.data.pagination)
    } catch { toast.error('خطأ في جلب المنتجات') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل تريد حذف "${name}"؟`)) return
    setDeleting(id)
    try {
      await productsAPI.delete(id)
      toast.success('تم حذف المنتج')
      fetchProducts()
    } catch { toast.error('خطأ في الحذف') }
    finally { setDeleting(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">المنتجات</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2"><Plus size={18} />إضافة منتج</Link>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="ابحث عن منتج..."
            className="input-field pr-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs">المنتج</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">السعر</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">المخزون</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400"><Package size={40} className="mx-auto mb-2 opacity-30" />لا توجد منتجات</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.thumbnail || '/placeholder-product.png'} alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                        onError={e => { e.target.src = '/placeholder-product.png' }} />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{p.name_ar || p.name}</p>
                        <p className="text-xs text-gray-400">{p.category_name_ar || p.category_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800">${Number(p.sale_price || p.price).toFixed(2)}</span>
                    {p.sale_price && <span className="text-xs text-gray-400 line-through mr-1">${Number(p.price).toFixed(2)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock <= 5 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {p.stock === 0 ? 'نفد' : p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/${p.id}/edit`}
                        className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id}
                        className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            <button disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">السابق</button>
            <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {pagination.totalPages}</span>
            <button disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">التالي</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
