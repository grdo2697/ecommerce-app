import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Truck, Shield, RefreshCw, Headphones, TrendingUp, Zap } from 'lucide-react'
import { productsAPI, categoriesAPI } from '../services/api'
import ProductCard from '../components/products/ProductCard'

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, catRes] = await Promise.all([
          productsAPI.getAll({ featured: 'true', limit: 8 }),
          productsAPI.getAll({ limit: 8, sort: 'created_at', order: 'DESC' }),
          categoriesAPI.getAll(),
        ])
        setFeaturedProducts(featuredRes.data.data.products)
        setNewProducts(newRes.data.data.products)
        setCategories(catRes.data.data.categories.slice(0, 6))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* ===== Hero ===== */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-purple-700 text-white py-20">
        <div className="container-app text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Zap size={14} /> عروض حصرية لفترة محدودة
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            اكتشف عالم<br />
            <span className="text-yellow-300">التسوق المميز</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-lg mx-auto">
            آلاف المنتجات بأسعار لا تُقاوم. توصيل سريع لجميع المناطق.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl">
              تسوق الآن
            </Link>
            <Link to="/products?featured=true" className="border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
              المنتجات المميزة
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'توصيل سريع', desc: 'خلال 2-3 أيام عمل' },
              { icon: Shield, title: 'دفع آمن', desc: 'بروتوكولات تشفير متقدمة' },
              { icon: RefreshCw, title: 'إرجاع مجاني', desc: 'خلال 30 يوم من الشراء' },
              { icon: Headphones, title: 'دعم 24/7', desc: 'نحن هنا دائماً لمساعدتك' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-3">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      {categories.length > 0 && (
        <section className="py-14">
          <div className="container-app">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">تسوق حسب التصنيف</h2>
                <p className="text-gray-500">اكتشف تشكيلة واسعة من المنتجات</p>
              </div>
              <Link to="/products" className="flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium text-sm">
                الكل <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="card p-4 text-center hover:border-primary-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors text-2xl">
                    📦
                  </div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                    {cat.name_ar || cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Featured Products ===== */}
      <section className="py-14 bg-gray-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={20} className="text-primary-600" />
                <span className="text-sm font-medium text-primary-600">الأكثر مبيعاً</span>
              </div>
              <h2 className="section-title">منتجات مميزة</h2>
            </div>
            <Link to="/products?featured=true" className="flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium text-sm">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton aspect-square" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ===== Promo Banner ===== */}
      <section className="py-14">
        <div className="container-app">
          <div className="bg-gradient-to-l from-primary-600 to-purple-700 rounded-3xl p-10 text-white text-center">
            <h2 className="text-3xl font-black mb-3">خصم 10% على طلبك الأول</h2>
            <p className="text-white/80 mb-6">استخدم كود <strong>WELCOME10</strong> عند الدفع</p>
            <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition-all inline-block">
              سجّل الآن واستفد
            </Link>
          </div>
        </div>
      </section>

      {/* ===== New Arrivals ===== */}
      <section className="py-14 bg-gray-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">وصل حديثاً</h2>
            <Link to="/products?sort=created_at&order=DESC" className="flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium text-sm">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
