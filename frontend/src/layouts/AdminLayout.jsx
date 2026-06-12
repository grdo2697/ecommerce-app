import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Star, LogOut, Menu, Store, ChevronLeft, Settings } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import NotificationBell from '../pages/admin/AdminNotifications'
import toast from 'react-hot-toast'

const menuItems = [
  { to: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'المنتجات', icon: Package },
  { to: '/admin/categories', label: 'التصنيفات', icon: Tags },
  { to: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
  { to: '/admin/users', label: 'المستخدمين', icon: Users },
  { to: '/admin/reviews', label: 'التقييمات', icon: Star },
  { to: '/admin/settings', label: 'الإعدادات', icon: Settings },
]

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); toast.success('تم تسجيل الخروج'); navigate('/') }

  return (
    <div className="min-h-screen bg-gray-100 flex" dir="rtl">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white flex flex-col transition-all duration-300 fixed h-full z-30`}>
        <div className="h-16 flex items-center justify-between px-4 bg-gray-800">
          {sidebarOpen && <div className="flex items-center gap-2"><Store size={22} className="text-primary-400" /><span className="font-bold text-lg">إدارة المتجر</span></div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-1 rounded">
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 mb-1 mx-2 rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <Icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-700 p-4">
          {sidebarOpen && <div className="mb-3"><p className="text-sm font-medium truncate">{user?.name}</p><p className="text-xs text-gray-400 truncate">{user?.email}</p></div>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors w-full">
            <LogOut size={18} />{sidebarOpen && <span className="text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'mr-64' : 'mr-16'} transition-all duration-300`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <h1 className="text-lg font-bold text-gray-700">لوحة التحكم</h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <NavLink to="/" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
              <Store size={16} /> عرض المتجر
            </NavLink>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <div className="page-transition"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}
export default AdminLayout
