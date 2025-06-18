import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || null)
  const token = ref(localStorage.getItem('token') || null)
  
  // 计算属性
  const isAuthenticated = computed(() => !!userInfo.value)
  const userId = computed(() => userInfo.value?.id)
  
  // 登录
  const login = (userData, userToken) => {
    userInfo.value = userData
    token.value = userToken
    
    // 保存到本地存储
    localStorage.setItem('userInfo', JSON.stringify(userData))
    localStorage.setItem('token', userToken)
  }
  
  // 退出登录
  const logout = () => {
    userInfo.value = null
    token.value = null
    
    // 清除本地存储
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }
  
  // 更新用户信息
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = { ...userInfo.value, ...newUserInfo }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }
  
  return {
    userInfo,
    token,
    isAuthenticated,
    userId,
    login,
    logout,
    updateUserInfo
  }
}) 