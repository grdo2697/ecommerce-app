import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { wishlistAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { formatIQD } from '../../utils/currency'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const addItem = useCartStore(s => s.addItem)
  const { isAuthenticated } = useAuthStore()

  const price = product.sale_price || product.price
  const hasDiscount = product.sale_price && product.sale_price < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : null

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (product.stock === 0) return
    addItem(product)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('سجّل دخولك أولاً')
      return
    }
    try {
      const res = await wishlistAPI.toggle(product.id)
      toast.success(res.data.data?.added ? 'أضيف للمفضلة ❤️' : 'أزيل من المفضلة')
    } catch {
      toast.error('حدث خطأ')
    }
  }

  return (
    <Link to={`/products/${product.slug}`} className="product-card group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = '/placeholder-product.png' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={48} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="badge bg-red-500 text-white">{discountPercent}% خصم</span>
          )}
          {product.is_featured && (
            <span className="badge bg-primary-600 text-white">مميز</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-500 text-white">نفد المخزون</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 left-2 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <Heart size={16} />
        </button>

        {/* Add to cart */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white py-2.5 text-sm font-medium flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200"
          >
            <ShoppingCart size={16} />
            أضف للسلة
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-1">{product.category_name_ar || product.category_name}</p>
        <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-relaxed">
          {product.name_ar || product.name}
        </h3>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} className={s <= Math.round(product.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.review_count})</span>
          </div>
        )}

        {/* Price - بالدينار العراقي */}
        <div className="space-y-0.5">
          <div className="text-base font-bold text-primary-600">{formatIQD(price)}</div>
          {hasDiscount && (
            <div className="text-xs text-gray-400 line-through">{formatIQD(product.price)}</div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
