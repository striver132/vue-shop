<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/toast'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// 加载购物车数据
onMounted(() => {
  if (userStore.isAuthenticated) {
    cartStore.fetchCartList()
  } else {
    router.push('/login')
  }
})

// 更新商品数量
const updateQuantity = async (id, quantity) => {
  if (quantity < 1) return
  try {
    const success = await cartStore.updateItemQuantity(id, quantity)
    if (success) {
      toast.success('数量已更新')
    } else {
      toast.error('更新失败，请重试')
    }
  } catch (error) {
    toast.error('更新失败，请重试')
  }
}

// 删除商品
const removeItem = async (id) => {
  try {
    const success = await cartStore.removeItem(id)
    if (success) {
      toast.success('商品已移除')
    } else {
      toast.error('移除失败，请重试')
    }
  } catch (error) {
    toast.error('移除失败，请重试')
  }
}

// 继续购物
const continueShopping = () => {
  router.push('/shop')
}

// 去结算
const checkout = () => {
  if (cartStore.isEmpty) {
    toast.warning('购物车为空，请先添加商品')
    return
  }
  router.push('/checkout')
}
</script>

<template>
  <div class="cart-container">
    <div class="cart-content">
      <h1>购物车</h1>

      <!-- 购物车为空 -->
      <div v-if="cartStore.isEmpty" class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>购物车是空的</p>
        <button class="primary-btn" @click="continueShopping">
          去购物
        </button>
      </div>

      <!-- 购物车列表 -->
      <div v-else class="cart-list">
        <!-- 商品列表 -->
        <div class="cart-items">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="cart-item"
          >
            <div class="item-image">
              <img :src="item.image" :alt="item.name">
            </div>
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-desc">{{ item.description }}</p>
              <div class="item-size" v-if="item.size">
                <span>{{ item.productType === 'shoes' ? '鞋码' : '尺码' }}: {{ item.size }}</span>
              </div>
              <div class="item-price">
                <span class="current-price">¥{{ item.price }}</span>
                <span v-if="item.originalPrice" class="original-price">
                  ¥{{ item.originalPrice }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <div class="quantity-control">
                <button 
                  @click="updateQuantity(item.id, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <span>{{ item.quantity }}</span>
                <button 
                  @click="updateQuantity(item.id, item.quantity + 1)"
                  :disabled="item.quantity >= item.stock"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <button 
                class="remove-btn"
                @click="removeItem(item.id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 结算区域 -->
        <div class="cart-summary">
          <div class="summary-row">
            <span>商品总数：</span>
            <span>{{ cartStore.totalCount }} 件</span>
          </div>
          <div class="summary-row total">
            <span>合计：</span>
            <span class="total-amount">¥{{ cartStore.totalAmount }}</span>
          </div>
          <button 
            class="checkout-btn"
            @click="checkout"
          >
            去结算
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  padding: 100px 20px 40px;
  min-height: 100vh;
  background: #f5f5f5;
}

.cart-content {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #1a237e;
  margin-bottom: 30px;
  font-size: 28px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.empty-cart i {
  font-size: 48px;
  color: #9fa8da;
  margin-bottom: 20px;
}

.empty-cart p {
  color: #666;
  margin-bottom: 30px;
}

.primary-btn {
  padding: 12px 32px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.primary-btn:hover {
  background: #283593;
}

.cart-list {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.cart-items {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr 200px;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 120px;
  height: 120px;
  overflow: hidden;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.item-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.item-size {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  color: #1a237e;
  font-size: 20px;
  font-weight: 600;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 14px;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
}

.quantity-control button {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.quantity-control button:hover:not(:disabled) {
  background: #e0e0e0;
}

.quantity-control button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.quantity-control span {
  min-width: 40px;
  text-align: center;
  font-size: 16px;
}

.remove-btn {
  border: none;
  background: none;
  color: #f44336;
  cursor: pointer;
  padding: 8px;
  transition: opacity 0.3s ease;
}

.remove-btn:hover {
  opacity: 0.8;
}

.cart-summary {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: fit-content;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #666;
}

.summary-row.total {
  color: #333;
  font-size: 18px;
  margin-bottom: 24px;
}

.total-amount {
  color: #1a237e;
  font-weight: 600;
  font-size: 24px;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.checkout-btn:hover {
  background: #283593;
}

@media (max-width: 768px) {
  .cart-list {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 100px 1fr;
  }

  .item-image {
    width: 100px;
    height: 100px;
  }

  .item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 12px;
  }
}
</style> 