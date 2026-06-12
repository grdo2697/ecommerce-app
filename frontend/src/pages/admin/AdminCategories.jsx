import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { categoriesAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_ar: '', description: '' })

  const fetch = () => {
    categoriesAPI.getAll()
      .then(res => setCategories(res.data.data.categories))
      .finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (editing) {
        await categoriesAPI.update(editing.id, form)
        toast.success('تم تعديل التصنيف')
        setEditing(null)
      } else {
        await categoriesAPI.create(form)
        toast.success('تم إضافة التصنيف')
        setShowForm(false)
      }
      setForm({ name: '', name_ar: '', description: '' })
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا التصنيف؟')) return
    try {
      await categoriesAPI.delete(id)
      toast.success('تم حذف التصنيف')
      fetch()
    } catch { toast.error('حدث خطأ') }
  }

  const startEdit = cat => {
    setEditing(cat)
    setForm({ name: cat.name, name_ar: cat.name_ar || '', description: cat.description || '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">التصنيفات</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', name_ar: '', description: '' }) }}
          className="btn-primary flex items-center gap-2"><Plus size={18} />إضافة تصنيف</button>
      </div>

      {(showForm || editing) && (
        <div className="card p-5 mb-5">
          <h3 className="font-bold text-gray-700 mb-4">{editing ? 'تعديل تصنيف' : 'تصنيف جديد'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (إنجليزي) *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field ltr" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي)</label>
              <input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" className="btn-primary px-6">{editing ? 'حفظ التعديلات' : 'إضافة'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary px-6">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs">الاسم</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الاسم العربي</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الحالة</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={4} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td></tr>)
              : categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.name_ar || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{cat.is_active ? 'نشط' : 'معطل'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(cat)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminCategories
