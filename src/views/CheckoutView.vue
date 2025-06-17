<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { createOrder } from '@/api/orders'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// 收货信息
const shippingInfo = ref({
  name: '',
  phone: '',
  address: '',
  zipCode: ''
})

// 表单验证状态
const formErrors = ref({
  name: '',
  phone: '',
  address: '',
  zipCode: ''
})

// 加载状态
const loading = ref(false)

// 验证手机号
const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 验证表单
const validateForm = () => {
  let isValid = true
  formErrors.value = {
    name: '',
    phone: '',
    address: '',
    zipCode: ''
  }

  if (!shippingInfo.value.name.trim()) {
    formErrors.value.name = '请输入收货人姓名'
    isValid = false
  }

  if (!validatePhone(shippingInfo.value.phone)) {
    formErrors.value.phone = '请输入正确的手机号'
    isValid = false
  }

  if (!shippingInfo.value.address.trim()) {
    formErrors.value.address = '请输入收货地址'
    isValid = false
  }

  if (!shippingInfo.value.zipCode.trim()) {
    formErrors.value.zipCode = '请输入邮政编码'
    isValid = false
  }

  return isValid
}

// 提交订单
const submitOrder = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    // 创建订单数据
    const orderData = {
      userId: userStore.userId,
      products: cartStore.items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: cartStore.totalAmount,
      shippingAddress: { ...shippingInfo.value },
      status: 'pending'
    }

    // 创建订单
    const order = await createOrder(orderData)
    
    // 清空购物车
    await cartStore.clearCart()

    // 跳转到订单详情页
    router.push(`/order/${order.id}`)
  } catch (error) {
    console.error('创建订单失败：', error)
    alert('创建订单失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回购物车
const backToCart = () => {
  router.push('/cart')
}

// 检查登录状态和购物车
onMounted(() => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (cartStore.isEmpty) {
    router.push('/cart')
    return
  }
})
</script>

<template>
  <div class="checkout-container">
    <div class="checkout-content">
      <h1>确认订单</h1>

      <!-- 商品清单 -->
      <div class="order-items">
        <h2>商品清单</h2>
        <div class="item-list">
          <div v-for="item in cartStore.items" :key="item.id" class="checkout-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.name">
            </div>
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-price">¥{{ item.price }} × {{ item.quantity }}</p>
            </div>
            <div class="item-total">
              ¥{{ item.price * item.quantity }}
            </div>
          </div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="shipping-info">
        <h2>收货信息</h2>
        <div class="form-group">
          <label>收货人</label>
          <input 
            type="text" 
            v-model="shippingInfo.name"
            :class="{ 'error': formErrors.name }"
            placeholder="请输入收货人姓名"
          >
          <span class="error-message" v-if="formErrors.name">{{ formErrors.name }}</span>
        </div>

        <div class="form-group">
          <label>手机号码</label>
          <input 
            type="tel" 
            v-model="shippingInfo.phone"
            :class="{ 'error': formErrors.phone }"
            placeholder="请输入手机号码"
          >
          <span class="error-message" v-if="formErrors.phone">{{ formErrors.phone }}</span>
        </div>

        <div class="form-group">
          <label>收货地址</label>
          <input 
            type="text" 
            v-model="shippingInfo.address"
            :class="{ 'error': formErrors.address }"
            placeholder="请输入详细地址"
          >
          <span class="error-message" v-if="formErrors.address">{{ formErrors.address }}</span>
        </div>

        <div class="form-group">
          <label>邮政编码</label>
          <input 
            type="text" 
            v-model="shippingInfo.zipCode"
            :class="{ 'error': formErrors.zipCode }"
            placeholder="请输入邮政编码"
          >
          <span class="error-message" v-if="formErrors.zipCode">{{ formErrors.zipCode }}</span>
        </div>
      </div>

      <!-- 订单总结 -->
      <div class="order-summary">
        <div class="summary-row">
          <span>商品总数：</span>
          <span>{{ cartStore.totalCount }} 件</span>
        </div>
        <div class="summary-row">
          <span>商品总价：</span>
          <span>¥{{ cartStore.totalAmount }}</span>
        </div>
        <div class="summary-row">
          <span>运费：</span>
          <span>免运费</span>
        </div>
        <div class="summary-row total">
          <span>应付总额：</span>
          <span class="total-amount">¥{{ cartStore.totalAmount }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="checkout-actions">
        <button class="back-btn" @click="backToCart">
          返回购物车
        </button>
        <button 
          class="submit-btn" 
          @click="submitOrder"
          :disabled="loading"
        >
          {{ loading ? '提交中...' : '提交订单' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  padding: 100px 20px 40px;
  min-height: 100vh;
  background: #f5f5f5;
}

.checkout-content {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  color: #1a237e;
  margin-bottom: 30px;
  font-size: 28px;
}

h2 {
  color: #333;
  font-size: 20px;
  margin-bottom: 20px;
}

.order-items,
.shipping-info,
.order-summary {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

/* 商品列表样式 */
.checkout-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.checkout-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.item-price {
  color: #666;
  font-size: 14px;
}

.item-total {
  color: #1a237e;
  font-weight: 600;
  font-size: 16px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #1a237e;
  outline: none;
}

.form-group input.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

/* 订单总结样式 */
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #666;
}

.summary-row.total {
  color: #333;
  font-size: 18px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.total-amount {
  color: #1a237e;
  font-weight: 600;
  font-size: 24px;
}

/* 按钮样式 */
.checkout-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.back-btn,
.submit-btn {
  padding: 12px 32px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
}

.back-btn:hover {
  background: #e0e0e0;
}

.submit-btn {
  background: #1a237e;
  border: none;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #283593;
}

.submit-btn:disabled {
  background: #9fa8da;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .checkout-item {
    grid-template-columns: 60px 1fr;
  }

  .item-total {
    grid-column: 1 / -1;
    text-align: right;
    margin-top: 8px;
  }

  .checkout-actions {
    flex-direction: column;
  }

  .back-btn,
  .submit-btn {
    width: 100%;
  }
}
</style> 