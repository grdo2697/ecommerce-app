import { Link } from 'react-router-dom'
import { Store, Mail, Phone, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react'

// ======================================
// عدّل هذي البيانات حسب متجرك
// ======================================
const STORE_INFO = {
  name: 'متجري',
  phone: '+964 770 000 0000',
  email: 'info@mystore.iq',
  address: 'بغداد، العراق',
  facebook: 'https://facebook.com/mystore',
  instagram: 'https://instagram.com/mystore',
  whatsapp: 'https://wa.me/9647700000000',
}
// ======================================

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-auto">
      <div className="container-app">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <Store size={26} className="text-primary-400" />
              {STORE_INFO.name}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              وجهتك الأولى للتسوق الإلكتروني في العراق. أفضل المنتجات بأسعار مناسبة وتوصيل سريع.
            </p>
            <div className="flex gap-3">
              <a href={STORE_INFO.facebook} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
              <a href={STORE_INFO.instagram} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href={STORE_INFO.whatsapp} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'الرئيسية' },
                { to: '/products', label: 'المنتجات' },
                { to: '/about', label: 'من نحن' },
                { to: '/contact', label: 'تواصل معنا' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">سياسات المتجر</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">سياسة الخصوصية</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">الشروط والأحكام</Link></li>
            </ul>
            <div className="mt-5 p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-green-400 font-semibold mb-1">💵 طريقة الدفع</p>
              <p className="text-xs text-gray-400">دفع نقدي عند الاستلام</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${STORE_INFO.email}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                  <Mail size={15} className="text-primary-400 shrink-0" />
                  {STORE_INFO.email}
                </a>
              </li>
              <li>
                <a href={`tel:${STORE_INFO.phone}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                  <Phone size={15} className="text-primary-400 shrink-0" />
                  {STORE_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-primary-400 shrink-0 mt-0.5" />
                <span>{STORE_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} {STORE_INFO.name}. جميع الحقوق محفوظة.</p>
          <p className="text-xs text-gray-600">🇮🇶 صُنع بكل حب للعراق</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
