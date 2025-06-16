import { defineStore } from 'pinia'
import { getCartList, addToCart, updateCartItem, removeFromCart, getProductDetail } from '@/api/cart'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false
  }),

  getters: {
    // 购物车商品总数
    totalCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
    // 购物车商品总价
    totalAmount: (state) => {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    // 是否为空
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    // 获取购物车列表
    async fetchCartList() {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) return

      this.loading = true
      try {
        const cartItems = await getCartList(userStore.userInfo.id)
        // 获取每个商品的详细信息
        const itemsWithDetails = await Promise.all(
          cartItems.map(async (item) => {
            const product = await getProductDetail(item.productId)
            return {
              ...item,
              ...product,
              price: product.price
            }
          })
        )
        this.items = itemsWithDetails
      } catch (error) {
        console.error('获取购物车失败：', error)
      } finally {
        this.loading = false
      }
    },

    // 添加商品到购物车
    async addItem(productId, quantity = 1) {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) {
        // 未登录时跳转到登录页
        router.push('/login')
        return
      }

      try {
        const data = {
          userId: userStore.userInfo.id,
          productId,
          quantity,
          createdAt: new Date().toISOString()
        }
        await addToCart(data)
        await this.fetchCartList() // 重新获取购物车列表
      } catch (error) {
        console.error('添加到购物车失败：', error)
        throw error
      }
    },

    // 更新商品数量
    async updateItemQuantity(id, quantity) {
      try {
        await updateCartItem(id, { quantity })
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index].quantity = quantity
        }
      } catch (error) {
        console.error('更新购物车失败：', error)
        throw error
      }
    },

    // 删除商品
    async removeItem(id) {
      try {
        await removeFromCart(id)
        this.items = this.items.filter(item => item.id !== id)
      } catch (error) {
        console.error('删除商品失败：', error)
        throw error
      }
    },

    // 清空购物车
    clearCart() {
      this.items = []
    }
  }
}) 