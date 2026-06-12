/**
 * Cart Store - Zustand
 * إدارة سلة المشتريات (تُحفظ في localStorage)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // عدد العناصر الكلية في السلة
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      // المجموع الكلي
      get totalPrice() {
        return get().items.reduce((sum, item) => {
          const price = item.sale_price || item.price
          return sum + (price * item.quantity)
        }, 0)
      },

      // إضافة منتج للسلة
      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existingIndex = items.findIndex(i => i.id === product.id)

        if (existingIndex >= 0) {
          // زيادة الكمية إذا كان موجوداً
          const updatedItems = [...items]
          updatedItems[existingIndex].quantity += quantity
          set({ items: updatedItems })
        } else {
          // إضافة منتج جديد
          set({ items: [...items, { ...product, quantity }] })
        }

        toast.success(`تمت إضافة "${product.name}" للسلة`, {
          icon: '🛒',
        })
      },

      // تحديث كمية منتج
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        }))
      },

      // حذف منتج من السلة
      removeItem: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== productId)
        }))
        toast.success('تمت إزالة المنتج من السلة')
      },

      // تفريغ السلة
      clearCart: () => {
        set({ items: [] })
      },

      // حساب المجموع الكلي (method)
      getTotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.sale_price || item.price
          return sum + (price * item.quantity)
        }, 0)
      },

      // حساب عدد العناصر
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      // التحقق من وجود منتج في السلة
      isInCart: (productId) => {
        return get().items.some(item => item.id === productId)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
