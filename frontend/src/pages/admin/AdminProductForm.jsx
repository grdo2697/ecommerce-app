import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowRight, Upload, X } from 'lucide-react'
import { productsAPI, categoriesAPI, uploadAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AdminProductForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: '', name_ar: '', description: '', description_ar: '',
    price: '', sale_price: '', sku: '', stock: '0',
    low_stock_alert: '5', category_id: '', is_active: true,
    is_featured: false, weight: '', thumbnail: '',
    meta_title: '', meta_description: ''
  })

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.data.categories))
    if (isEdit) {
      // جلب المنتج للتعديل (نحتاج endpoint بالـ id)
      productsAPI.getAll({ limit: 1 }).then(() => {
        // في التطبيق الحقيقي: productsAPI.getById(id)
      })
    }
  }, [isEdit, id])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await uploadAPI.productImage(fd)
      setForm(prev => ({ ...prev, thumbnail: res.data.data.url }))
      toast.success('تم رفع الصورة')
    } catch { toast.error('فشل رفع الصورة') }
    finally { setUploading(false) }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('اسم المنتج والسعر مطلوبان'); return }
    setLoading(true)
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        stock: parseInt(form.stock) || 0,
        low_stock_alert: parseInt(form.low_stock_alert) || 5,
        category_id: form.category_id || null,
        weight: form.weight ? parseFloat(form.weight) : null,
      }
      if (isEdit) {
        await productsAPI.update(id, data)
        toast.success('تم تعديل المنتج بنجاح')
      } else {
        await productsAPI.create(data)
        toast.success('تم إضافة المنتج بنجاح')
      }
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="text-gray-400 hover:text-gray-600"><ArrowRight size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'تعديل منتج' : 'إضافة منتج جديد'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-5">
              <h3 className="font-bold text-gray-700 mb-4">معلومات المنتج</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج (عربي) *</label>
                    <input name="name_ar" value={form.name_ar} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج (إنجليزي) *</label>
                    <input name="name" value={form.name} onChange={handleChange} className="input-field ltr" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (عربي)</label>
                  <textarea name="description_ar" value={form.description_ar} onChange={handleChange} rows={3} className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (إنجليزي)</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none ltr" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-700 mb-4">السعر والمخزون</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأصلي ($) *</label>
                  <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} className="input-field ltr" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر الخصم ($)</label>
                  <input name="sale_price" type="number" step="0.01" min="0" value={form.sale_price} onChange={handleChange} className="input-field ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكمية في المخزون</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="input-field ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">حد التنبيه للمخزون</label>
                  <input name="low_stock_alert" type="number" min="0" value={form.low_stock_alert} onChange={handleChange} className="input-field ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رمز المنتج (SKU)</label>
                  <input name="sku" value={form.sku} onChange={handleChange} className="input-field ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوزن (كغ)</label>
                  <input name="weight" type="number" step="0.001" min="0" value={form.weight} onChange={handleChange} className="input-field ltr" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Image */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-700 mb-4">صورة المنتج</h3>
              {form.thumbnail ? (
                <div className="relative">
                  <img src={form.thumbnail} alt="thumbnail" className="w-full aspect-square object-cover rounded-xl" />
                  <button type="button" onClick={() => setForm(p => ({ ...p, thumbnail: '' }))}
                    className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="block aspect-square rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-primary-400 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-primary-500">
                  {uploading
                    ? <div className="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full" />
                    : <><Upload size={32} className="mb-2" /><span className="text-sm">انقر لرفع صورة</span><span className="text-xs mt-1">PNG, JPG, WebP (max 5MB)</span></>
                  }
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            {/* Category & Options */}
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-gray-700">التصنيف والخيارات</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field">
                  <option value="">بدون تصنيف</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar || c.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm text-gray-700">منشور (نشط)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm text-gray-700">منتج مميز</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : null}
              {loading ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إضافة المنتج')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminProductForm
