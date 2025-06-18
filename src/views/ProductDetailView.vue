<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/cart'
import { toast } from '@/utils/toast'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { buyNow } from '@/api/orders'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const productId = route.params.id


const product = ref(null)
const loading = ref(true)
const error = ref('')
const selectedImage = ref('')
const selectedSize = ref('')
const quantity = ref(1)
const addToCartLoading = ref(false)
const buyNowLoading = ref(false)

// 尺码类型映射
const sizeTypeLabels = {
  'clothing': '尺码',
  'shoes': '鞋码',
  'accessory': '规格'
}

// 计算属性：获取尺码类型标签
const sizeTypeLabel = computed(() => {
  if (!product.value) return '尺码'
  return sizeTypeLabels[product.value.productType] || '尺码'
})

// 计算属性：判断是否有尺码选择
const hasSizes = computed(() => {
  return product.value && product.value.sizes && product.value.sizes.length > 0
})

onMounted(async () => {
  try {
    loading.value = true
    const res = await getProductDetail(productId)
    
    product.value = res
    selectedImage.value = res.images && res.images.length ? res.images[0] : res.image
    selectedSize.value = ''
  } catch (e) {
    error.value = '商品加载失败'
  } finally {
    loading.value = false
  }
})

const handleSelectImage = (img) => {
  selectedImage.value = img
}

const handleSelectSize = (size) => {
  selectedSize.value = size
}

// 增加数量
const increaseQuantity = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  }
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 添加到购物车
const handleAddToCart = async () => {
  // 检查登录状态
  if (!userStore.isAuthenticated) {
    toast.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 检查是否选择了尺码（如果有尺码选项）
  if (hasSizes.value && !selectedSize.value) {
    toast.warning(`请选择${sizeTypeLabel.value}`)
    return
  }
  
  addToCartLoading.value = true
  
  try {
    // 添加到购物车
    const success = await cartStore.addToCart({
      productId: productId,
      quantity: quantity.value,
      size: selectedSize.value
    })
    
    if (success) {
      toast.success('已加入购物车！')
    } else {
      toast.error('添加失败，请重试')
    }
  } catch (error) {
    console.error('添加到购物车失败：', error)
    toast.error('添加失败，请重试')
  } finally {
    addToCartLoading.value = false
  }
}

// 添加立即购买处理函数
const handleBuyNow = async () => {
  if (!userStore.isAuthenticated) {
    toast.warning('请先登录')
    router.push({ 
      path: '/login', 
      query: { redirect: route.fullPath } 
    })
    return
  }
  
  if (!selectedSize.value && product.value.sizes?.length > 0) {
    toast.warning(`请选择${sizeTypeLabel.value}`)
    return
  }
  
  buyNowLoading.value = true
  
  try {
    // 构建订单数据，与db.json中的orders结构匹配
    const orderData = {
      userId: userStore.userId,
      products: [
        {
          productId: product.value.id,
          quantity: quantity.value,
          price: product.value.price
        }
      ],
      totalAmount: product.value.price * quantity.value,
      status: "pending",
      createdAt: new Date().toISOString()
    }
    
    // 调用API创建订单
    const order = await buyNow(orderData)
    
    if (order && order.id) {
      toast.success('订单已创建，请完成支付')
      // 跳转到结账页面
      router.push({
        path: '/checkout',
        query: { orderId: order.id }
      })
    } else {
      toast.error('创建订单失败')
    }
  } catch (error) {
    console.error('购买失败:', error)
    toast.error('购买失败，请稍后重试')
  } finally {
    buyNowLoading.value = false
  }
}
</script>

<template>
  <main class="product-detail">
    <div v-if="loading" class="loading">商品加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <nav class="breadcrumb">
        <span>分类</span>
        <span>></span>
        <span>{{ product.categoryId }}</span>
        <span>></span>
        <span>{{ product.name }}</span>
      </nav>
      <div class="detail-container">
        <!-- 左侧图片区 -->
        <div class="gallery">
          <div class="main-image">
            <img :src="selectedImage" :alt="product.name" />
          </div>
          <div class="thumbnails" v-if="product.images && product.images.length">
            <div 
              v-for="(img, idx) in product.images" 
              :key="idx"
              :class="['thumb', { active: selectedImage === img }]"
              @click="handleSelectImage(img)">
              <img :src="img" :alt="product.name + ' ' + (idx+1)" />
            </div>
          </div>
        </div>
        <!-- 右侧信息区 -->
        <div class="info">
          <h1 class="title">{{ product.name }}</h1>
          <div class="rating">
            <span class="stars">
              <i v-for="i in 5" :key="i" :class="['fas', i <= Math.round(product.rating) ? 'fa-star' : 'fa-star-o']"></i>
            </span>
            <span class="review-count">{{ product.reviews }} 条评价</span>
          </div>
          <div class="price">¥{{ product.price }}</div>
          <div class="tags" v-if="product.tags && product.tags.length">
            <span class="tag" v-for="tag in product.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="stock">库存：{{ product.stock }}</div>
          
          <!-- 尺码选择区域 - 根据商品类型显示不同的尺码选项 -->
          <div class="size-select" v-if="hasSizes">
            <div class="label">{{ sizeTypeLabel }}</div>
            <div class="size-options">
              <!-- 服装尺码 -->
              <template v-if="product.productType === 'clothing'">
                <button 
                  v-for="size in product.sizes" 
                  :key="size"
                  :class="['size-btn', { selected: selectedSize === size }]"
                  @click="handleSelectSize(size)">
                  {{ size }}
                </button>
              </template>
              
              <!-- 鞋子尺码 -->
              <template v-else-if="product.productType === 'shoes'">
                <button 
                  v-for="size in product.sizes" 
                  :key="size"
                  :class="['size-btn', { selected: selectedSize === size }]"
                  @click="handleSelectSize(size)">
                  {{ size }}
                </button>
              </template>
              
              <!-- 配饰尺码/规格 -->
              <template v-else-if="product.productType === 'accessory'">
                <button 
                  v-for="size in product.sizes" 
                  :key="size"
                  :class="['size-btn', { selected: selectedSize === size }]"
                  @click="handleSelectSize(size)">
                  {{ size }}
                </button>
              </template>
            </div>
          </div>
          
          <!-- 数量选择 -->
          <div class="quantity-select">
            <div class="label">数量</div>
            <div class="quantity-control">
              <button 
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              >
                <i class="fas fa-minus"></i>
              </button>
              <span>{{ quantity }}</span>
              <button 
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          
          <button class="add-cart-btn" :disabled="addToCartLoading" @click="handleAddToCart">
            <span v-if="addToCartLoading">加入中...</span>
            <span v-else><i class="fas fa-shopping-cart"></i> 加入购物车</span>
          </button>
          
          <button class="buy-now-btn" :disabled="buyNowLoading" @click="handleBuyNow">
            <span v-if="buyNowLoading">处理中...</span>
            <span v-else><i class="fas fa-bolt"></i> 立即购买</span>
          </button>
          
          <div class="desc">
            <h3>商品描述</h3>
            <p>{{ product.description }}</p>
            <div v-if="product.specifications">
              <h4>商品参数</h4>
              <ul>
                <li v-for="(val, key) in product.specifications" :key="key">{{ key }}：{{ val }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}
.breadcrumb {
  color: #999;
  font-size: 14px;
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.detail-container {
  display: flex;
  gap: 48px;
  background: #fafbfc;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.gallery {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-image {
  width: 420px;
  height: 340px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.thumbnails {
  display: flex;
  gap: 12px;
}
.thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  background: #fff;
  transition: border 0.2s;
}
.thumb.active {
  border: 2px solid #1a237e;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.title {
  font-size: 28px;
  font-weight: 700;
  color: #222;
  margin-bottom: 6px;
}
.rating {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #fbc02d;
}
.stars i {
  margin-right: 2px;
}
.review-count {
  color: #888;
  font-size: 14px;
}
.price {
  font-size: 32px;
  color: #1a237e;
  font-weight: 700;
  margin: 10px 0 18px 0;
}
.tags {
  margin-bottom: 8px;
}
.tag {
  display: inline-block;
  background: #e3f2fd;
  color: #1a237e;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  margin-right: 6px;
}
.stock {
  color: #666;
  font-size: 15px;
  margin-bottom: 8px;
}
.size-select {
  margin-bottom: 12px;
}
.label {
  font-size: 15px;
  color: #333;
  margin-bottom: 6px;
}
.size-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.size-btn {
  min-width: 44px;
  padding: 8px 0;
  border-radius: 6px;
  border: 1.5px solid #ddd;
  background: #fff;
  color: #222;
  font-size: 15px;
  cursor: pointer;
  transition: border 0.2s, background 0.2s;
}
.size-btn.selected, .size-btn:hover {
  border: 2px solid #1a237e;
  background: #e3f2fd;
}
.add-cart-btn {
  margin-top: 18px;
  width: 100%;
  padding: 14px 0;
  background: #1a237e;
  color: #fff;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  margin-bottom: 12px;
}
.add-cart-btn:disabled {
  background: #9fa8da;
  cursor: not-allowed;
}
.add-cart-btn i {
  margin-right: 8px;
}
.buy-now-btn {
  width: 100%;
  padding: 14px 0;
  background: #f44336;
  color: #fff;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}
.buy-now-btn:hover {
  background: #e53935;
}
.buy-now-btn:disabled {
  background: #ef9a9a;
  cursor: not-allowed;
}
.desc {
  margin-top: 24px;
  background: #fff;
  border-radius: 8px;
  padding: 18px 20px;
  color: #444;
  font-size: 15px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.desc h3 {
  font-size: 18px;
  color: #1a237e;
  margin-bottom: 8px;
}
@media (max-width: 1024px) {
  .detail-container {
    flex-direction: column;
    gap: 32px;
    padding: 24px 8px;
  }
  .main-image {
    width: 100%;
    height: 260px;
  }
}
@media (max-width: 600px) {
  .product-detail {
    padding: 0 4px;
  }
  .detail-container {
    padding: 10px 2px;
  }
  .main-image {
    height: 180px;
  }
  .desc {
    padding: 10px 8px;
  }
}
.loading {
  text-align: center;
  color: #888;
  font-size: 18px;
  padding: 60px 0;
}
.error {
  text-align: center;
  color: #f44336;
  font-size: 18px;
  padding: 60px 0;
}

/* 添加数量选择样式 */
.quantity-select {
  margin-top: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  width: fit-content;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 8px;
}

.quantity-control button {
  width: 36px;
  height: 36px;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-control button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.quantity-control span {
  width: 50px;
  text-align: center;
  font-size: 16px;
}
</style> 