<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserOrders, updateOrderStatus } from '@/api/orders'
import { getProductDetail } from '@/api/cart'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/toast'

const router = useRouter()
const userStore = useUserStore()
const orders = ref([])
const loading = ref(false)
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

// 加载订单列表和对应的商品详情
const loadOrders = async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const response = await getUserOrders(userStore.userId)
    orders.value = response

    // 加载所有订单中商品的详细信息
    for (const order of orders.value) {
      for (const product of order.products) {
        console.log(product.productId);
        await loadProductDetails(product.productId)
      }
    }
  } catch (error) {
    console.error('加载订单失败：', error)
  } finally {
    loading.value = false
  }
}

// 获取商品详情的计算属性
const getProductDetails = (productId) => {
  return productsCache.value.get(productId) || {}
}

// 支付订单
const handlePayOrder = async (orderId) => {
  try {
    await updateOrderStatus(orderId, 'paid')
    // 刷新订单列表
    loadOrders()
    toast.success('支付成功！')
  } catch (error) {
    console.error('支付失败：', error)
    toast.error('支付失败，请重试')
  }
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/order/${orderId}`)
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

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <main class="orders">
    <div class="orders-container">
      <h1>我的订单</h1>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载订单中...</p>
      </div>

      <!-- 订单列表 -->
      <div v-else-if="orders.length" class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号：{{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-status" :style="{ color: statusMap[order.status]?.color }">
              {{ statusMap[order.status]?.text }}
            </div>
          </div>

          <div class="order-products">
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
                  <span class="product-quantity">x{{ product.quantity }}</span>
                  <span class="product-price">¥{{ product.price }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              总计：<span class="total-amount">¥{{ calculateTotal(order.products) }}</span>
            </div>
            <div class="order-actions">
              <button 
                class="action-btn detail"
                @click="viewOrderDetail(order.id)"
              >
                查看详情
              </button>
              <button 
                v-if="order.status === 'pending'"
                class="action-btn pay"
                @click="handlePayOrder(order.id)"
              >
                立即支付
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 无订单状态 -->
      <div v-else class="empty-state">
        <p>暂无订单</p>
        <button class="shop-btn" @click="router.push('/shop')">
          去购物
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.orders {
  max-width: 1200px;
  margin: 80px auto;
  padding: 0 20px;
}

.orders-container h1 {
  font-size: 32px;
  color: #1a237e;
  margin-bottom: 32px;
  text-align: center;
}

/* 订单卡片样式 */
.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
}

.order-info {
  display: flex;
  gap: 16px;
  color: #666;
}

.order-number {
  font-weight: 600;
}

.order-status {
  font-weight: 600;
}

.order-products {
  padding: 16px;
  border-bottom: 1px solid #eee;
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
  justify-content: space-between;
  align-items: center;
}

.product-quantity {
  color: #666;
  font-size: 14px;
}

.product-price {
  color: #1a237e;
  font-weight: 600;
  font-size: 16px;
}

.order-footer {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  color: #666;
}

.total-amount {
  color: #1a237e;
  font-size: 20px;
  font-weight: 600;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-btn.detail {
  background: #e3f2fd;
  color: #1a237e;
}

.action-btn.detail:hover {
  background: #bbdefb;
}

.action-btn.pay {
  background: #1a237e;
  color: white;
}

.action-btn.pay:hover {
  background: #283593;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px 0;
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.shop-btn {
  margin-top: 20px;
  padding: 12px 32px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.shop-btn:hover {
  background: #283593;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .orders {
    margin: 40px auto;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .order-info {
    flex-direction: column;
    gap: 4px;
  }

  .order-footer {
    flex-direction: column;
    gap: 16px;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
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
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .orders {
    padding: 0 10px;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style> 