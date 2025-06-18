import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getCartList, 
  addToCart as addToCartApi, 
  updateCartItem, 
  removeFromCart,
  getProductDetail
} from '@/api/cart'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)
  const userStore = useUserStore()

  // 计算属性
  const totalCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalAmount = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const isEmpty = computed(() => {
    return items.value.length === 0
  })

  // 获取购物车列表
  const fetchCartList = async () => {
    if (!userStore.isAuthenticated) return
    
    loading.value = true
    try {
      const cartItems = await getCartList(userStore.userId)
      
      // 对于每个购物车项，获取商品详情
      const itemsWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const product = await getProductDetail(item.productId)
            return {
              ...item,
              name: product.name,
              image: product.image,
              description: product.description,
              stock: product.stock
            }
          } catch (error) {
            console.error(`获取商品详情失败: ${item.productId}`, error)
            return item
          }
        })
      )
      
      items.value = itemsWithDetails
    } catch (error) {
      console.error('获取购物车失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 添加商品到购物车
  const addToCart = async (productData) => {
    if (!userStore.isAuthenticated) return false
    
    try {
      // 检查商品是否已在购物车中
      const existingItem = items.value.find(item => 
        item.productId === productData.productId && 
        item.size === productData.size
      )

      if (existingItem) {
        // 如果已存在，更新数量
        const newQuantity = existingItem.quantity + productData.quantity
        await updateItemQuantity(existingItem.id, newQuantity)
      } else {
        // 如果不存在，添加新项目
        const product = await getProductDetail(productData.productId)
        
        const cartItem = {
          userId: userStore.userId,
          productId: productData.productId,
          quantity: productData.quantity,
          price: product.price,
          size: productData.size
        }
        
        const newItem = await addToCartApi(cartItem)
        
        // 添加商品详情
        items.value.push({
          ...newItem,
          name: product.name,
          image: product.image,
          description: product.description,
          stock: product.stock
        })
      }
      
      return true
    } catch (error) {
      console.error('添加到购物车失败:', error)
      return false
    }
  }

  // 更新购物车商品数量
  const updateItemQuantity = async (itemId, quantity) => {
    try {
      await updateCartItem(itemId, { quantity })
      
      // 更新本地状态
      const index = items.value.findIndex(item => item.id === itemId)
      if (index !== -1) {
        items.value[index].quantity = quantity
      }
      
      return true
    } catch (error) {
      console.error('更新购物车失败:', error)
      return false
    }
  }

  // 从购物车中移除商品
  const removeItem = async (itemId) => {
    try {
      await removeFromCart(itemId)
      
      // 更新本地状态
      items.value = items.value.filter(item => item.id !== itemId)
      
      return true
    } catch (error) {
      console.error('删除购物车商品失败:', error)
      return false
    }
  }

  // 清空购物车
  const clearCart = async () => {
    try {
      // 逐个删除购物车中的商品
      for (const item of items.value) {
        await removeFromCart(item.id)
      }
      
      // 清空本地状态
      items.value = []
      
      return true
    } catch (error) {
      console.error('清空购物车失败:', error)
      return false
    }
  }

  return {
    items,
    loading,
    totalCount,
    totalAmount,
    isEmpty,
    fetchCartList,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart
  }
}) 