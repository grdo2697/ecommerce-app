/**
 * Auth Store - Zustand
 * إدارة حالة المصادقة (تسجيل الدخول والخروج)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // تسجيل الدخول
      login: (userData, token) => {
        localStorage.setItem('token', token)
        set({
          user: userData,
          token,
          isAuthenticated: true,
        })
      },

      // تسجيل الخروج
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      // تحديث بيانات المستخدم
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      // التحقق من الصلاحيات
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage', // اسم في localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
