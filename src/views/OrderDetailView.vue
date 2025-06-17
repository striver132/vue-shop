<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, updateOrderStatus } from '@/api/orders'
import { getProductDetail } from '@/api/cart'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const order = ref(null)
const loading = ref(true)
const error = ref(null)
const productsCache = ref(new Map())

// 订单状态映射
const statusMap = {
  'pending': { text: '待支付', color: '#ff9800' },
  'paid': { text: '已支付', color: '#4caf50' },
  'shipping': { text: '配送中', color: '#2196f3' },
  'completed': { text: '已完成', color: '#8bc34a' },
  'cancelled': { text: '已取消', color: '#f44336' }
}

// 获取商品详情
const loadProductDetails = async (productId) => {
  if (productsCache.value.has(productId)) {
    return productsCache.value.get(productId)
  }
  try {
    const product = await getProductDetail(productId)
    productsCache.value.set(productId, product)
    return product
  } catch (error) {
    console.error('加载商品详情失败：', error)
    return null
  }
}

// 获取订单详情
const loadOrderDetail = async (orderId) => {
  loading.value = true
  error.value = null
  
  try {
    const orderData = await getOrderDetail(orderId)
    
    // 验证订单所有者
    if (orderData.userId !== userStore.userId) {
      router.push('/orders')
      return
    }
    
    order.value = orderData
    
    // 加载所有商品详情
    for (const product of order.value.products) {
      await loadProductDetails(product.productId)
    }
  } catch (err) {
    console.error('获取订单详情失败:', err)
    error.value = '获取订单详情失败，请重试'
  } finally {
    loading.value = false
  }
}

// 支付订单
const handlePayOrder = async () => {
  try {
    await updateOrderStatus(order.value.id, 'paid')
    // 刷新订单数据
    await loadOrderDetail(order.value.id)
    alert('支付成功！')
  } catch (error) {
    console.error('支付失败：', error)
    alert('支付失败，请重试')
  }
}

// 获取商品详情
const getProductDetails = (productId) => {
  return productsCache.value.get(productId) || {}
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算订单总价
const calculateTotal = (products) => {
  return products.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// 返回订单列表
const backToOrders = () => {
  router.push('/orders')
}

onMounted(() => {
  // 检查登录状态
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  const orderId = route.params.id
  if (orderId) {
    loadOrderDetail(orderId)
  } else {
    router.push('/orders')
  }
})
</script>

<template>
  <main class="order-detail">
    <div class="order-container">
      <div class="page-header">
        <button class="back-btn" @click="backToOrders">
          <i class="fas fa-arrow-left"></i> 返回订单列表
        </button>
        <h1>订单详情</h1>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载订单中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="primary-btn" @click="backToOrders">
          返回订单列表
        </button>
      </div>

      <!-- 订单详情 -->
      <div v-else-if="order" class="order-content">
        <!-- 订单状态 -->
        <div class="order-status-card">
          <div class="order-header">
            <div class="order-info">
              <div class="order-number">订单号：{{ order.id }}</div>
              <div class="order-date">下单时间：{{ formatDate(order.createdAt) }}</div>
              <div v-if="order.updatedAt" class="order-date">
                更新时间：{{ formatDate(order.updatedAt) }}
              </div>
            </div>
            <div class="status-badge" :style="{ backgroundColor: statusMap[order.status]?.color }">
              {{ statusMap[order.status]?.text }}
            </div>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="order-products-card">
          <h2>商品信息</h2>
          <div class="products-list">
            <div v-for="product in order.products" :key="product.productId" class="product-item">
              <div class="product-image">
                <img 
                  :src="getProductDetails(product.productId).image" 
                  :alt="getProductDetails(product.productId).name"
                >
              </div>
              <div class="product-info">
                <div class="product-name">{{ getProductDetails(product.productId).name }}</div>
                <div class="product-desc">{{ getProductDetails(product.productId).description }}</div>
                <div class="product-meta">
                  <span class="product-price">¥{{ product.price }}</span>
                  <span class="product-quantity">x{{ product.quantity }}</span>
                  <span class="product-subtotal">小计：¥{{ product.price * product.quantity }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="order-total">
            总计：<span class="total-amount">¥{{ calculateTotal(order.products) }}</span>
          </div>
        </div>

        <!-- 收货信息 -->
        <div class="shipping-card">
          <h2>收货信息</h2>
          <div class="shipping-info">
            <div class="info-row">
              <span class="label">收货人：</span>
              <span class="value">{{ order.shippingAddress.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系电话：</span>
              <span class="value">{{ order.shippingAddress.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货地址：</span>
              <span class="value">{{ order.shippingAddress.address }}</span>
            </div>
            <div class="info-row">
              <span class="label">邮政编码：</span>
              <span class="value">{{ order.shippingAddress.zipCode }}</span>
            </div>
          </div>
        </div>

        <!-- 订单操作 -->
        <div class="order-actions-card" v-if="order.status === 'pending'">
          <button class="pay-btn" @click="handlePayOrder">
            立即支付
          </button>
        </div>
      </div>

      <!-- 订单不存在 -->
      <div v-else class="empty-state">
        <i class="fas fa-file-alt"></i>
        <p>订单不存在</p>
        <button class="primary-btn" @click="backToOrders">
          返回订单列表
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.order-detail {
  max-width: 1000px;
  margin: 80px auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  text-decoration: underline;
}

h1 {
  font-size: 28px;
  color: #1a237e;
  margin: 0 auto;
  text-align: center;
}

h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.order-status-card,
.order-products-card,
.shipping-card,
.order-actions-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 24px;
  margin-bottom: 24px;
}

/* 订单状态样式 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-number {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.order-date {
  color: #666;
  font-size: 14px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

/* 商品列表样式 */
.products-list {
  margin-bottom: 24px;
}

.product-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  margin-right: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.product-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-price {
  color: #1a237e;
  font-weight: 600;
}

.product-quantity {
  color: #666;
}

.product-subtotal {
  margin-left: auto;
  font-weight: 600;
}

.order-total {
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #eee;
  color: #666;
}

.total-amount {
  color: #1a237e;
  font-size: 24px;
  font-weight: 600;
  margin-left: 8px;
}

/* 收货信息样式 */
.shipping-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.label {
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.value {
  color: #333;
  font-weight: 500;
}

/* 订单操作样式 */
.order-actions-card {
  display: flex;
  justify-content: flex-end;
}

.pay-btn {
  padding: 12px 32px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.pay-btn:hover {
  background: #283593;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1a237e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.error-state i,
.empty-state i {
  font-size: 48px;
  color: #9fa8da;
  margin-bottom: 16px;
}

.primary-btn {
  margin-top: 20px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .shipping-info {
    grid-template-columns: 1fr;
  }

  .product-item {
    flex-direction: column;
  }

  .product-image {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 16px;
  }

  .product-meta {
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .product-subtotal {
    margin-left: 0;
    width: 100%;
    margin-top: 8px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .status-badge {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }

  .back-btn {
    position: static;
    margin-bottom: 8px;
  }

  h1 {
    font-size: 24px;
  }

  .pay-btn {
    width: 100%;
  }
}
</style> 