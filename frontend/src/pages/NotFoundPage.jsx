import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

const NotFoundPage = () => (
  <div className="min-h-[80vh] flex items-center justify-center px-4">
    <div className="text-center">
      <div className="text-9xl font-black text-primary-100 mb-4 select-none">404</div>
      <h1 className="text-3xl font-black text-gray-800 mb-3">الصفحة غير موجودة</h1>
      <p className="text-gray-500 mb-8">يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary flex items-center justify-center gap-2"><Home size={18} />الرئيسية</Link>
        <Link to="/products" className="btn-secondary flex items-center justify-center gap-2"><Search size={18} />تصفح المنتجات</Link>
      </div>
    </div>
  </div>
)

export default NotFoundPage
