import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatIQD } from '../utils/currency'

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const total = getTotal()
  const count = getItemCount()

  if (items.length === 0) return (
    <div className="container-app py-20 text-center">
      <div className="text-8xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-3">سلتك فارغة</h2>
      <p className="text-gray-500 mb-8">أضف بعض المنتجات الرائعة لسلتك</p>
      <Link to="/products" className="btn-primary inline-flex items-center gap-2">
        <ShoppingCart size={18} /> تسوق الآن
      </Link>
    </div>
  )

  return (
    <div className="container-app py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          سلة المشتريات <span className="text-primary-600">({count})</span>
        </h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
          <Trash2 size={14} /> تفريغ السلة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const price = item.sale_price || item.price
            return (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <img
                  src={item.thumbnail || '/placeholder-product.png'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl shrink-0"
                  onError={e => { e.target.src = '/placeholder-product.png' }}
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug}`}
                    className="font-semibold text-gray-800 hover:text-primary-600 text-sm line-clamp-2">
                    {item.name_ar || item.name}
                  </Link>
                  <p className="text-primary-600 font-bold mt-1">{formatIQD(price)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-800 text-sm">{formatIQD(price * item.quantity)}</p>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 mt-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h2 className="font-bold text-gray-800 text-lg mb-4">ملخص الطلب</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>المجموع ({count} منتج)</span>
                <span>{formatIQD(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>الشحن</span>
                <span className="text-green-600 font-medium">مجاني 🎁</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800 text-base">
                <span>الإجمالي</span>
                <span className="text-primary-600">{formatIQD(total)}</span>
              </div>
            </div>
            <button
              onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login')}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isAuthenticated ? 'إتمام الطلب' : 'سجّل دخولك للمتابعة'}
            </button>
            <Link to="/products"
              className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-primary-600 mt-3">
              <ArrowLeft size={14} /> متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
