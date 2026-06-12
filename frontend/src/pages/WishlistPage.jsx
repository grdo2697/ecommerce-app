import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { wishlistAPI } from '../services/api'
import ProductCard from '../components/products/ProductCard'
import toast from 'react-hot-toast'

const WishlistPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wishlistAPI.get()
      .then(res => setItems(res.data.data.items))
      .catch(() => toast.error('خطأ في جلب المفضلة'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container-app py-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-5">{[...Array(4)].map((_, i) => <div key={i} className="card"><div className="skeleton aspect-square"/><div className="p-3 space-y-2"><div className="skeleton h-4 w-3/4"/><div className="skeleton h-4 w-1/2"/></div></div>)}</div></div>

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Heart size={24} className="text-red-500 fill-red-500" /> قائمة الرغبات
        <span className="text-primary-600">({items.length})</span>
      </h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">💔</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">قائمة الرغبات فارغة</h3>
          <p className="text-gray-400">أضف المنتجات التي تعجبك لمتابعتها لاحقاً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map(item => <ProductCard key={item.id} product={item} />)}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
