import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// إضافة التوكن لكل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// معالجة الأخطاء - إذا التوكن منتهي امسحه وارجع لتسجيل الدخول
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    if (!response) {
      toast.error('لا يوجد اتصال بالخادم - تأكد من تشغيل الباك إند')
      return Promise.reject(error)
    }

    // توكن منتهي أو غير صالح
    if (response.status === 401) {
      // امسح بيانات الجلسة
      localStorage.removeItem('token')
      localStorage.removeItem('auth-storage')

      toast.error('انتهت صلاحية الجلسة، سيتم تحويلك لتسجيل الدخول')

      // انتظر ثانية ثم حوّل
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)

      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

// ============================
// API Methods
// ============================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
}

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (slug) => api.get(`/products/${slug}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateThumbnail: (id, data) => api.patch(`/products/${id}/thumbnail`, data),
}

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
}

export const paymentsAPI = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (data) => api.post('/payments/confirm', data),
}

export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  getPending: () => api.get('/reviews/pending'),
}

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (product_id) => api.post('/wishlist/toggle', { product_id }),
}

export const usersAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
}

export const uploadAPI = {
  productImage: (formData) => api.post('/upload/product-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  productImages: (formData) => api.post('/upload/product-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  avatar: (formData) => api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getCoupons: () => api.get('/admin/coupons'),
  addCoupon: (data) => api.post('/admin/coupons', data),
  toggleCoupon: (id) => api.patch(`/admin/coupons/${id}/toggle`),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
}

export default api
