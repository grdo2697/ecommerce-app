import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { productsAPI, categoriesAPI } from '../services/api'
import ProductCard from '../components/products/ProductCard'

const sortOptions = [
  { value: 'created_at-DESC', label: 'الأحدث' },
  { value: 'price-ASC', label: 'السعر: الأقل أولاً' },
  { value: 'price-DESC', label: 'السعر: الأعلى أولاً' },
  { value: 'avg_rating-DESC', label: 'الأعلى تقييماً' },
  { value: 'total_sold-DESC', label: 'الأكثر مبيعاً' },
]

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter state from URL
  const currentCategory = searchParams.get('category') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentSort = searchParams.get('sort') || 'created_at'
  const currentOrder = searchParams.get('order') || 'DESC'
  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentMinPrice = searchParams.get('min_price') || ''
  const currentMaxPrice = searchParams.get('max_price') || ''
  const currentFeatured = searchParams.get('featured') || ''

  const [minPrice, setMinPrice] = useState(currentMinPrice)
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice)

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.data.categories))
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort: currentSort,
        order: currentOrder,
      }
      if (currentCategory) params.category = currentCategory
      if (currentSearch) params.search = currentSearch
      if (currentMinPrice) params.min_price = currentMinPrice
      if (currentMaxPrice) params.max_price = currentMaxPrice
      if (currentFeatured) params.featured = currentFeatured

      const res = await productsAPI.getAll(params)
      setProducts(res.data.data.products)
      setPagination(res.data.data.pagination)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries())
    if (value) params[key] = value
    else delete params[key]
    delete params.page
    setSearchParams(params)
  }

  const handleSortChange = (e) => {
    const [sort, order] = e.target.value.split('-')
    const params = Object.fromEntries(searchParams.entries())
    params.sort = sort
    params.order = order
    setSearchParams(params)
  }

  const handlePriceFilter = (e) => {
    e.preventDefault()
    const params = Object.fromEntries(searchParams.entries())
    if (minPrice) params.min_price = minPrice; else delete params.min_price
    if (maxPrice) params.max_price = maxPrice; else delete params.max_price
    delete params.page
    setSearchParams(params)
  }

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSearchParams({})
  }

  const hasFilters = currentCategory || currentSearch || currentMinPrice || currentMaxPrice || currentFeatured

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {currentSearch ? `نتائج: "${currentSearch}"` : 'جميع المنتجات'}
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} منتج</p>}
        </div>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
              <X size={14} /> مسح الفلاتر
            </button>
          )}
          <select
            value={`${currentSort}-${currentOrder}`}
            onChange={handleSortChange}
            className="input-field py-2 w-auto text-sm"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden btn-secondary py-2 px-3 flex items-center gap-2 text-sm"
          >
            <Filter size={16} /> فلترة
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="card p-4 sticky top-20 space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal size={18} /> الفلاتر
            </h3>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">التصنيفات</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!currentCategory}
                    onChange={() => updateParam('category', '')}
                    className="text-primary-600"
                  />
                  <span className="text-sm text-gray-700">جميع التصنيفات</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={currentCategory === cat.slug}
                      onChange={() => updateParam('category', cat.slug)}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700">{cat.name_ar || cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">نطاق السعر</h4>
              <form onSubmit={handlePriceFilter} className="space-y-2">
                <input
                  type="number"
                  placeholder="الحد الأدنى"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="input-field py-2 text-sm"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="الحد الأقصى"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="input-field py-2 text-sm"
                  min="0"
                />
                <button type="submit" className="btn-primary py-2 w-full text-sm">تطبيق</button>
              </form>
            </div>

            {/* In Stock */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchParams.get('in_stock') === 'true'}
                  onChange={e => updateParam('in_stock', e.target.checked ? 'true' : '')}
                  className="text-primary-600"
                />
                <span className="text-sm text-gray-700">المتوفر فقط</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton aspect-square" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
              <p>جرّب تغيير معايير البحث أو الفلترة</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => updateParam('page', currentPage - 1)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    السابق
                  </button>
                  {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => updateParam('page', p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                          p === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => updateParam('page', currentPage + 1)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
