import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star, Minus, Plus, ArrowRight, Check, Package } from 'lucide-react'
import { productsAPI, wishlistAPI, reviewsAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatIQD } from "../utils/currency"
import ProductCard from '../components/products/ProductCard'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState('desc')
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    productsAPI.getOne(slug)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('المنتج غير موجود'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddCart = () => {
    if (!data?.product) return
    addItem(data.product, qty)
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('سجّل دخولك أولاً'); return }
    try {
      const res = await wishlistAPI.toggle(data.product.id)
      toast.success(res.data.data?.added ? 'أضيف للمفضلة ❤️' : 'أزيل من المفضلة')
    } catch { toast.error('حدث خطأ') }
  }

  const handleReviewSubmit = async e => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('سجّل دخولك لإضافة تقييم'); return }
    setSubmittingReview(true)
    try {
      await reviewsAPI.create({ product_id: data.product.id, ...review })
      toast.success('شكراً! تقييمك في انتظار المراجعة')
      setReview({ rating: 5, title: '', comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ')
    } finally { setSubmittingReview(false) }
  }

  if (loading) return (
    <div className="container-app py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-6 rounded" />)}
        </div>
      </div>
    </div>
  )

  if (!data) return <div className="text-center py-20"><h2 className="text-xl text-gray-500">المنتج غير موجود</h2></div>

  const { product, reviews, relatedProducts } = data
  const images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : []
  const allImages = product.thumbnail ? [product.thumbnail, ...images.filter(i => i !== product.thumbnail)] : images
  const price = product.sale_price || product.price
  const hasDiscount = product.sale_price && product.sale_price < product.price
  const discountPct = hasDiscount ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0

  return (
    <div className="container-app py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">الرئيسية</Link>
        <ArrowRight size={14} />
        <Link to="/products" className="hover:text-primary-600">المنتجات</Link>
        <ArrowRight size={14} />
        {product.category_name_ar && <><Link to={`/products?category=${product.category_slug}`} className="hover:text-primary-600">{product.category_name_ar}</Link><ArrowRight size={14} /></>}
        <span className="text-gray-800 font-medium">{product.name_ar || product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <img
              src={allImages[activeImg] || '/placeholder-product.png'}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = '/placeholder-product.png' }}
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${i === activeImg ? 'border-primary-500' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category_name_ar && (
            <Link to={`/products?category=${product.category_slug}`}
              className="text-sm text-primary-600 font-medium mb-2 inline-block hover:text-primary-800">
              {product.category_name_ar}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name_ar || product.name}</h1>

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} className={s <= Math.round(product.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{Number(product.avg_rating).toFixed(1)} ({product.review_count} تقييم)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-black text-primary-600">${Number(price).toFixed(2)}</span>
            {hasDiscount && <>
              <span className="text-lg text-gray-400 line-through">${Number(product.price).toFixed(2)}</span>
              <span className="badge bg-red-100 text-red-600">{discountPct}% خصم</span>
            </>}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 mb-5 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? <><Check size={16} /> متوفر في المخزون ({product.stock} قطعة)</> : <><Package size={16} /> نفد من المخزون</>}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700">الكمية:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"><Minus size={16} /></button>
                <span className="w-10 text-center font-semibold text-gray-800">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"><Plus size={16} /></button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddCart} disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart size={18} /> أضف للسلة
            </button>
            <button onClick={handleWishlist}
              className="btn-secondary w-12 h-12 flex items-center justify-center p-0">
              <Heart size={20} />
            </button>
          </div>

          {/* SKU */}
          {product.sku && <p className="text-xs text-gray-400">رمز المنتج: {product.sku}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-14">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { key: 'desc', label: 'الوصف' },
            { key: 'reviews', label: `التقييمات (${reviews.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'desc' && (
          <div className="prose max-w-none text-gray-600 leading-relaxed">
            {product.description_ar || product.description || 'لا يوجد وصف متاح.'}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد تقييمات حتى الآن. كن أول من يقيّم!</p>
            ) : reviews.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {r.user_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{r.user_name}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 mr-auto">{new Date(r.created_at).toLocaleDateString('ar')}</span>
                </div>
                {r.title && <p className="font-semibold text-gray-800 text-sm mb-1">{r.title}</p>}
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}

            {/* Add Review */}
            {isAuthenticated && (
              <div className="card p-5 mt-6">
                <h3 className="font-bold text-gray-800 mb-4">أضف تقييمك</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التقييم</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReview({...review, rating: s})}>
                          <Star size={28} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input value={review.title} onChange={e => setReview({...review, title: e.target.value})}
                    placeholder="عنوان التقييم (اختياري)" className="input-field" />
                  <textarea value={review.comment} onChange={e => setReview({...review, comment: e.target.value})}
                    placeholder="شاركنا رأيك في المنتج..." rows={3} className="input-field resize-none" />
                  <button type="submit" disabled={submittingReview} className="btn-primary">
                    {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="section-title mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetailPage
