import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, Search, User, Menu, X, LogOut, Package, Settings, Store, ChevronDown, MapPin } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, logout } = useAuthStore()
  const cartCount = useCartStore(s => s.getItemCount())
  const navigate = useNavigate()
  const location = useLocation()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleSearch = e => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  const handleLogout = () => { logout(); toast.success('تم تسجيل الخروج بنجاح'); navigate('/'); setUserMenuOpen(false) }

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/products', label: 'المنتجات' },
    { to: '/track', label: 'تتبع الطلب' },
    { to: '/about', label: 'من نحن' },
    { to: '/contact', label: 'تواصل معنا' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Store size={28} className="text-primary-600" />
            <span className="hidden sm:block">متجري</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${location.pathname === link.to ? 'text-primary-600' : 'text-gray-600'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <Search size={20} />
            </button>
            {isAuthenticated && (
              <Link to="/wishlist" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
                <Heart size={20} />
              </Link>
            )}
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="notification-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    : <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">{user?.name?.charAt(0)}</div>
                  }
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"><User size={16} /> الملف الشخصي</Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"><Package size={16} /> طلباتي</Link>
                    <Link to="/track" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"><MapPin size={16} /> تتبع طلب</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors font-medium"><Settings size={16} /> لوحة التحكم</Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-right">
                      <LogOut size={16} /> تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-4 text-sm hidden sm:flex items-center gap-1">
                <User size={16} /> دخول
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="py-3 border-t border-gray-100 animate-slide-down">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتجات..." className="input-field" autoFocus />
              <button type="submit" className="btn-primary px-4 py-3"><Search size={18} /></button>
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 animate-slide-down">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl font-medium">
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-3 px-4">
                <Link to="/login" className="btn-primary flex-1 text-center py-2">دخول</Link>
                <Link to="/register" className="btn-secondary flex-1 text-center py-2">إنشاء حساب</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
export default Navbar
