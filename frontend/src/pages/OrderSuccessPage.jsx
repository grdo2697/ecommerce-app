import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Package, Home, Phone, Clock } from 'lucide-react'

const OrderSuccessPage = () => {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')
  const total = params.get('total')
  const discount = params.get('discount')

  return (
    <div className="container-app py-16">
      <div className="max-w-lg mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={52} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">تم إرسال طلبك! 🎉</h1>
          <p className="text-gray-500">شكراً لطلبك، سنتواصل معك قريباً لتأكيد التوصيل</p>
        </div>

        {/* Order Info */}
        <div className="card p-6 mb-5">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">رقم الطلب (تكت)</span>
            <span className="font-black text-xl text-primary-600 tracking-wider">{orderNumber}</span>
          </div>

          {total && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">إجمالي الطلب</span>
              <span className="font-bold text-gray-800">${Number(total).toFixed(2)}</span>
            </div>
          )}

          {discount && Number(discount) > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">الخصم المطبق</span>
              <span className="font-bold text-green-600">-${Number(discount).toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">طريقة الدفع</span>
            <span className="font-semibold text-gray-700">💵 دفع عند الاستلام</span>
          </div>
        </div>

        {/* Steps */}
        <div className="card p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">شنو يصير بعدين؟</h3>
          <div className="space-y-3">
            {[
              { icon: Phone, text: 'سنتصل بك لتأكيد الطلب', color: 'bg-blue-100 text-blue-600' },
              { icon: Package, text: 'نحضّر طلبك ونشحنه', color: 'bg-purple-100 text-purple-600' },
              { icon: Clock, text: 'يوصلك الطلب وتدفع عند الاستلام', color: 'bg-green-100 text-green-600' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl ${step.color} flex items-center justify-center shrink-0`}>
                  <step.icon size={16} />
                </div>
                <p className="text-sm text-gray-700">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/orders" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Package size={18} /> تتبع طلباتي
          </Link>
          <Link to="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Home size={18} /> الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
