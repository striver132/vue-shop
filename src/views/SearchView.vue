<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchProducts, searchProductsByCategory } from '@/api/search'
import { addToCart } from '@/api/cart'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const keyword = ref('')
const selectedCategory = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const totalResults = ref(0)

// 分类选项
const categories = [
  { id: '', name: '全部分类' },
  { id: 1, name: '男装', icon: '👔' },
  { id: 2, name: '女装', icon: '👗' },
  { id: 3, name: '鞋履', icon: '👟' },
  { id: 4, name: '配饰', icon: '👜' },
  { id: 5, name: '运动', icon: '🏃' }
]

// 执行搜索
const performSearch = async () => {
  if (!keyword.value.trim()) {
    searchResults.value = []
    totalResults.value = 0
    return
  }
  
  isLoading.value = true
  try {
    const results = selectedCategory.value
      ? await searchProductsByCategory(keyword.value.trim(), selectedCategory.value)
      : await searchProducts(keyword.value.trim())
    
    searchResults.value = results
    totalResults.value = results.length
  } catch (error) {
    console.error('搜索失败：', error)
    searchResults.value = []
    totalResults.value = 0
  } finally {
    isLoading.value = false
  }
}

// 处理搜索提交
const handleSearch = () => {
  if (!keyword.value.trim()) return
  
  performSearch()
  // 更新URL参数
  router.push({
    query: {
      q: keyword.value.trim(),
      category: selectedCategory.value
    }
  })
}

// 从URL参数中恢复搜索状态
onMounted(() => {
  const { q, category } = route.query
  if (q) {
    keyword.value = q
    selectedCategory.value = category || ''
    performSearch()
  }
})

// 添加到购物车
const addToCartHandler = async (product) => {
  if (!userStore.isAuthenticated) {
    // 保存当前页面路径
    localStorage.setItem('redirectPath', route.fullPath)
    router.push('/login')
    return
  }

  try {
    await addToCart({
      userId: userStore.userId,
      productId: product.id,
      quantity: 1,
      createdAt: new Date().toISOString()
    })
    // 显示成功提示
    alert('成功添加到购物车')
  } catch (error) {
    console.error('添加到购物车失败：', error)
    alert('添加失败，请重试')
  }
}
</script>

<template>
  <main class="search-view">
    <div class="search-container">
      <h1>搜索商品</h1>
      
      <!-- 搜索表单 -->
      <div class="search-form">
        <div class="search-input-group">
          <input 
            type="text" 
            v-model="keyword"
            placeholder="输入关键词搜索..."
            @keyup.enter="handleSearch"
          >
          <button @click="handleSearch" class="search-btn">
            <i class="fas fa-search"></i>
            搜索
          </button>
        </div>
        
        <div class="category-filters">
          <button 
            v-for="category in categories"
            :key="category.id"
            :class="['category-btn', { active: selectedCategory === category.id }]"
            @click="selectedCategory = category.id"
          >
            <span v-if="category.icon" class="category-icon">{{ category.icon }}</span>
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="keyword">
        <div class="results-header" v-if="!isLoading">
          <h2>搜索结果</h2>
          <p>共找到 {{ totalResults }} 个商品</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <p>正在搜索中...</p>
        </div>

        <!-- 结果网格 -->
        <div v-else-if="searchResults.length" class="products-grid">
          <div 
            v-for="product in searchResults" 
            :key="product.id"
            class="product-card"
          >
            <div class="product-image" @click="router.push(`/product/${product.id}`)">
              <img :src="product.image" :alt="product.name">
            </div>
            <div class="product-info">
              <span class="product-category">{{ categories.find(c => c.id === product.categoryId)?.name }}</span>
              <h3 class="product-name" @click="router.push(`/product/${product.id}`)">{{ product.name }}</h3>
              <p class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
              </p>
              <div class="product-tags" v-if="product.tags && product.tags.length">
                <span class="tag" v-for="tag in product.tags" :key="tag">{{ tag }}</span>
              </div>
              <button class="add-to-cart-btn" @click="addToCartHandler(product)">
                <i class="fas fa-shopping-cart"></i>
                加入购物车
              </button>
            </div>
          </div>
        </div>

        <!-- 无结果状态 -->
        <div v-else-if="!isLoading" class="no-results">
          <p>未找到相关商品</p>
          <p class="suggestion">试试其他关键词或选择不同分类</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.search-view {
  padding: 80px 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-container h1 {
  font-size: 32px;
  color: #1a237e;
  margin-bottom: 32px;
  text-align: center;
}

/* 搜索表单样式 */
.search-form {
  margin-bottom: 40px;
}

.search-input-group {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input-group input {
  flex: 1;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.search-input-group input:focus {
  outline: none;
  border-color: #1a237e;
}

.search-btn {
  padding: 12px 32px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn:hover {
  background: #283593;
}

/* 分类过滤器样式 */
.category-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-btn.active {
  background: #1a237e;
  color: white;
  border-color: #1a237e;
}

.category-btn:hover {
  border-color: #1a237e;
  color: #1a237e;
}

.category-btn.active:hover {
  color: white;
}

.category-icon {
  font-size: 18px;
}

/* 搜索结果样式 */
.results-header {
  margin-bottom: 24px;
}

.results-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.results-header p {
  color: #666;
}

/* 复用 HomeView 的产品网格样式 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.product-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
  cursor: pointer;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 16px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 12px;
}

.product-category {
  font-size: 14px;
  color: #666;
}

.product-name {
  font-size: 16px;
  margin: 8px 0;
  color: #333;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
}

.current-price {
  color: #1a237e;
  font-weight: 600;
  font-size: 18px;
  margin-right: 8px;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 14px;
}

.product-tags {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e3f2fd;
  color: #1a237e;
}

/* 加载和无结果状态 */
.loading-state,
.no-results {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.no-results .suggestion {
  margin-top: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .category-filters {
    justify-content: center;
  }
}

.add-to-cart-btn {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #283593;
}

.add-to-cart-btn i {
  font-size: 16px;
}

/* 让商品卡片更有层次感 */
.product-card {
  padding-bottom: 12px;
}

/* 点击效果 */
.product-name:hover,
.product-image:hover {
  opacity: 0.8;
}

.add-to-cart-btn:active {
  transform: scale(0.98);
}
</style>
