import { useState, useEffect, useRef } from 'react'
import { Bell, Package, Star, AlertTriangle, CheckCheck } from 'lucide-react'
import { adminAPI } from '../../services/api'

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const buildNotifications = (data) => {
    const notifs = []
    data.recentOrders?.slice(0, 3).forEach(o => {
      notifs.push({
        id: `order-${o.id}`, type: 'order', icon: Package, color: 'text-blue-500 bg-blue-50',
        title: `طلب جديد ${o.order_number}`,
        body: `${o.user_name} - ${(o.total * 1300).toLocaleString('ar-IQ')} د.ع`,
        time: new Date(o.created_at).toLocaleDateString('ar-IQ'), read: false
      })
    })
    if (data.products?.low_stock_count > 0) {
      notifs.push({
        id: 'low-stock', type: 'warning', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50',
        title: 'مخزون منخفض',
        body: `${data.products.low_stock_count} منتج يحتاج إعادة تخزين`,
        time: 'الآن', read: false
      })
    }
    return notifs
  }

  useEffect(() => {
    adminAPI.getDashboard().then(res => {
      const notifs = buildNotifications(res.data.data)
      setNotifications(notifs)
      setUnread(notifs.filter(n => !n.read).length)
    }).catch(() => {})

    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-slide-down" dir="rtl">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">الإشعارات</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary-600 flex items-center gap-1 hover:text-primary-800">
                <CheckCheck size={14} /> قراءة الكل
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${n.color} flex items-center justify-center shrink-0`}>
                    <n.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export default NotificationBell
