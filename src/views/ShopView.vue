<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useIntersectionObserver } from '@vueuse/core'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

// 分类数据
const categories = [
  { id: 1, name: '男装', code: 'men', icon: '👔' },
  { id: 2, name: '女装', code: 'women', icon: '👗' },
  { id: 3, name: '鞋履', code: 'shoes', icon: '👟' },
  { id: 4, name: '配饰', code: 'accessories', icon: '👜' },
]

// 状态管理
const products = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 8
const selectedCategory = ref(null)
const searchQuery = ref('')

// 价格筛选
const priceRange = ref([0, 10000]) // 默认价格范围
const minPrice = ref(0)
const maxPrice = ref(10000)

// 更新最大价格
const updateMaxPrice = () => {
  if (products.value.length > 0) {
    const highestPrice = Math.max(...products.value.map(p => p.price))
    maxPrice.value = Math.ceil(highestPrice / 100) * 100 // 向上取整到百位
    priceRange.value = [0, maxPrice.value]
  }
}

// 筛选后的商品列表
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter(p => p.categoryId === selectedCategory.value)
  }
  
  // 关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    )
  }

  // 价格筛选
  result = result.filter(p => 
    p.price >= priceRange.value[0] && 
    p.price <= priceRange.value[1]
  )
  
  return result
})

// 加载商品数据
const loadProducts = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const response = await fetch(`http://localhost:3000/products?_page=${currentPage.value}&_limit=${pageSize}`)
    const newProducts = await response.json()
    
    if (newProducts.length < pageSize) {
      hasMore.value = false
    }
    
    products.value = [...products.value, ...newProducts]
    currentPage.value++
    updateMaxPrice() // 更新最大价格
  } catch (error) {
    console.error('加载商品失败：', error)
  } finally {
    loading.value = false
  }
}

// 选择分类
const handleCategorySelect = (categoryId) => {
  if (selectedCategory.value === categoryId) {
    selectedCategory.value = null
  } else {
    selectedCategory.value = categoryId
  }
}

// 前往商品详情
const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// 添加到购物车
const addToCart = (event, product) => {
  event.stopPropagation() // 阻止事件冒泡，避免触发商品详情跳转
  // 这里添加购物车逻辑
  console.log('添加到购物车:', product.name)
  console.log(product);
  // TODO: 实现购物车功能
  
}

// 格式化价格显示
const formatPrice = (price) => {
  return `¥${price}`
}

// 设置无限滚动
const loadingTrigger = ref(null)
useIntersectionObserver(loadingTrigger, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    loadProducts()
  }
})

// 初始加载
onMounted(() => {
  loadProducts()
})
</script>

<template>
  <main class="shop">
    <!-- 顶部搜索和筛选区 -->
    <div class="shop-header">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="搜索商品..."
          class="search-input"
        >
      </div>
      
      <!-- 筛选器容器 -->
      <div class="filters-container">
        <!-- 分类按钮 -->
        <div class="categories">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="['category-btn', { active: selectedCategory === category.id }]"
            @click="handleCategorySelect(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            {{ category.name }}
          </button>
        </div>

        <!-- 价格筛选器 -->
        <div class="price-filter">
          <h3>价格区间</h3>
          <div class="price-range">
            <span class="price-label">{{ formatPrice(priceRange[0]) }}</span>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="priceRange[0]" 
                :min="minPrice" 
                :max="maxPrice"
                class="slider min-slider"
                :style="{ '--min-value': ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100 + '%' }"
              >
              <input 
                type="range" 
                v-model.number="priceRange[1]" 
                :min="minPrice" 
                :max="maxPrice"
                class="slider max-slider"
                :style="{ '--max-value': ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100 + '%' }"
              >
            </div>
            <span class="price-label">{{ formatPrice(priceRange[1]) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="products-grid">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        @click="goToProduct(product.id)"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name">
          <div class="product-tags" v-if="product.tags && product.tags.length">
            <span 
              v-for="tag in product.tags" 
              :key="tag" 
              class="tag"
            >{{ tag }}</span>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-footer">
            <div class="product-price">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price" v-if="product.originalPrice">
                ¥{{ product.originalPrice }}
              </span>
            </div>
            <button 
              class="cart-btn" 
              @click="addToCart($event, product)"
              title="添加到购物车"
            >
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多触发器 -->
    <div 
      ref="loadingTrigger" 
      class="loading-trigger"
      v-if="hasMore"
    >
      <div v-if="loading" class="loading-spinner"></div>
      <p v-else>向下滚动加载更多</p>
    </div>

    <!-- 无更多数据提示 -->
    <div v-if="!hasMore && products.length > 0" class="no-more">
      没有更多商品了
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && filteredProducts.length === 0" class="no-data">
      未找到相关商品
    </div>
  </main>
</template>

<style scoped>
.shop {
  max-width: 1200px;
  margin: 80px auto;
  padding: 0 20px;
}

.shop-header {
  margin-bottom: 40px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #1a237e;
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.categories {
  flex: 1;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-btn:hover {
  border-color: #1a237e;
  color: #1a237e;
}

.category-btn.active {
  background: #1a237e;
  border-color: #1a237e;
  color: white;
}

.category-icon {
  font-size: 18px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-tags {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
}

.tag {
  padding: 4px 8px;
  background: rgba(26, 35, 126, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.cart-btn {
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.cart-btn:hover {
  background: #303f9f;
  transform: scale(1.1);
}

.loading-trigger {
  text-align: center;
  padding: 20px 0;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1a237e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-more, .no-data {
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-container {
    flex-direction: column;
  }

  .price-filter {
    width: 100%;
  }

  .categories {
    order: -1; /* 在移动端将分类按钮放在价格筛选器上面 */
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .shop {
    padding: 0 10px;
    margin: 20px auto;
  }
  
  .categories {
    gap: 8px;
  }
  
  .category-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 价格筛选器样式 */
.price-filter {
  width: 300px;
  margin: 0;
  padding: 0 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.price-filter h3 {
  color: #333;
  font-size: 14px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 15px;
}

.price-label {
  min-width: 60px;
  color: #1a237e;
  font-weight: 600;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 40px;
}

.slider {
  position: absolute;
  width: 100%;
  height: 4px;
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: #1a237e;
  cursor: pointer;
  pointer-events: auto;
  -webkit-appearance: none;
  margin-top: -4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
}

.min-slider {
  background: linear-gradient(
    to right,
    #e0e0e0 var(--min-value),
    #1a237e var(--min-value),
    #1a237e var(--max-value),
    #e0e0e0 var(--max-value)
  );
}

.max-slider {
  background: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .price-range {
    flex-direction: column;
    align-items: stretch;
  }
  
  .price-label {
    text-align: center;
  }
}
</style>