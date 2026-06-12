import { useState, useEffect } from 'react'
import { Star, Check } from 'lucide-react'
import { reviewsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(null)

  const fetch = () => {
    reviewsAPI.getPending()
      .then(res => setReviews(res.data.data.reviews))
      .catch(() => toast.error('خطأ في جلب التقييمات'))
      .finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const handleApprove = async (id) => {
    setApproving(id)
    try {
      await reviewsAPI.approve(id)
      toast.success('تمت الموافقة على التقييم')
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch { toast.error('حدث خطأ') }
    finally { setApproving(null) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">التقييمات المعلقة</h1>
      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card p-5"><div className="skeleton h-20 rounded" /></div>)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Star size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">لا توجد تقييمات معلقة</p>
          <p className="text-sm mt-1">جميع التقييمات تمت مراجعتها</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">{r.user_name?.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{r.user_name}</p>
                      <p className="text-xs text-gray-400">{r.product_name}</p>
                    </div>
                    <div className="flex mr-auto">
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />)}
                    </div>
                  </div>
                  {r.title && <p className="font-semibold text-gray-800 text-sm mb-1">{r.title}</p>}
                  <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString('ar')}</p>
                </div>
                <button
                  onClick={() => handleApprove(r.id)}
                  disabled={approving === r.id}
                  className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
                >
                  <Check size={16} />
                  موافقة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminReviews
