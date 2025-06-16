import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isAuthenticated = computed(() => {
    return !!(token.value && userInfo.value && userInfo.value.username)
  })

  // 模拟登录
  const login = async (credentials) => {
    try {
      // 模拟登录成功
      const mockUser = {
        id: 1,
        username: credentials.username,
        email: 'user@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + credentials.username
      }
      
      const mockToken = btoa(credentials.username + ':' + Date.now())
      token.value = mockToken
      userInfo.value = mockUser
      localStorage.setItem('token', mockToken)
      localStorage.setItem('userInfo', JSON.stringify(mockUser))
      return true
    } catch (error) {
      console.error('登录失败：', error)
      return false
    }
  }

  // 模拟注册
  const register = async (userData) => {
    try {
      // 模拟注册成功
      const mockUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userData.username
      }
      
      // 直接返回成功
      return true
    } catch (error) {
      console.error('注册失败：', error)
      return false
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    register,
    logout
  }
}) 