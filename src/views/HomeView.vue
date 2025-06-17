<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCarousels, getRecommendedProducts } from '@/api/home'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 轮播图数据
const carouselItems = ref([])
const currentSlide = ref(0)

// 推荐商品数据
const recommendedProducts = ref([])

// 加载数据
const loadData = async () => {
  try {
    // 并行加载数据
    const [carouselData, productsData] = await Promise.all([
      getCarousels(),
      getRecommendedProducts()
    ])
    carouselItems.value = carouselData
    recommendedProducts.value = productsData
  } catch (error) {
    console.error('加载数据失败：', error)
  }
}

// 轮播图控制函数
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + carouselItems.value.length) % carouselItems.value.length
}

// 自动轮播
let autoplayInterval
const startAutoplay = () => {
  autoplayInterval = setInterval(nextSlide, 5000)
}

const stopAutoplay = () => {
  clearInterval(autoplayInterval)
}

// 组件挂载时加载数据并启动自动轮播
onMounted(() => {
  loadData()
  startAutoplay()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  stopAutoplay()
})

// 检查登录状态并处理导航
const handleNavigation = (path) => {
  if (!userStore.isAuthenticated) {
    // 保存用户想要访问的页面路径
    localStorage.setItem('redirectPath', path)
    router.push('/login')
    return false
  }
  return true
}
</script>

<template>
  <main class="home">
    <!-- 轮播图部分 -->
    <section class="hero-carousel" 
      @mouseenter="stopAutoplay" 
      @mouseleave="startAutoplay">
      <div class="carousel-container" v-if="carouselItems.length">
        <div class="carousel-slides" 
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="item in carouselItems" 
            :key="item.id" 
            class="carousel-slide">
            <img :src="item.image" :alt="item.title">
            <div class="slide-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.subtitle }}</p>
              <a href="#" class="slide-btn" @click.prevent="handleNavigation(item.link) && router.push(item.link)">
                立即探索
              </a>
            </div>
          </div>
        </div>
        
        <button class="carousel-control prev" @click="prevSlide">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="carousel-control next" @click="nextSlide">
          <i class="fas fa-chevron-right"></i>
        </button>
        
        <div class="carousel-indicators">
          <button 
            v-for="(_, index) in carouselItems" 
            :key="index"
            :class="{ active: currentSlide === index }"
            @click="currentSlide = index">
          </button>
        </div>
      </div>
    </section>

    <!-- 推荐商品部分 -->
    <section class="recommended-products">
      <div class="section-header">
        <h2>精选推荐</h2>
        <p>为您精心挑选的品质好物</p>
      </div>
      
      <div class="products-grid" v-if="recommendedProducts.length">
        <a 
          v-for="product in recommendedProducts" 
          :key="product.id"
          href="#"
          @click.prevent="handleNavigation(`/product/${product.id}`) && router.push(`/product/${product.id}`)"
          class="product-card">
          <div class="product-image">
            <img :src="product.image" :alt="product.name">
          </div>
          <div class="product-info">
            <!-- <span class="product-category">{{ product.categoryId }}</span> -->
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
            </p>
            <div class="product-tags" v-if="product.tags && product.tags.length">
              <span class="tag" v-for="tag in product.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </a>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-state">
        <p>正在加载商品数据...</p>
      </div>
    </section>

    <section class="featured-categories">
  <div class="grid-container">
    <div class="category-card large">
      <img src="/pic2.png" alt="奢华时尚">
      <div class="card-content">
        <h3>奢华时尚典藏</h3>
        <p>演绎优雅格调</p>
        <a href="#" class="shop-now" @click.prevent="handleNavigation('/category/luxury') && router.push('/category/luxury')">立即选购</a>
      </div>
    </div>
    
    <div class="category-card medium">
      <img src="/pic1.png" alt="女装精选">
      <div class="card-content">
        <h3>春季新品上市</h3>
        <p>为每个女性绽放魅力</p>
        <a href="#" class="shop-now" @click.prevent="handleNavigation('/category/women') && router.push('/category/women')">立即选购</a>
      </div>
    </div>
    
    <div class="category-card small">
      <img src="/pic1.png" alt="时尚鞋履">
      <div class="card-content">
        <h3>潮流鞋履</h3>
        <p>都市生活新主张</p>
        <a href="#" class="shop-now" @click.prevent="handleNavigation('/category/shoes') && router.push('/category/shoes')">立即选购</a>
      </div>
    </div>
    
    <div class="category-card small">
      <img src="/pic1.png" alt="时尚包包">
      <div class="card-content">
        <h3>精选包袋</h3>
        <p>限时5折优惠</p>
        <a href="#" class="shop-now" @click.prevent="handleNavigation('/category/bags') && router.push('/category/bags')">立即选购</a>
      </div>
    </div>
  </div>
</section>
  </main>
</template>

<style scoped>
.home {
  padding-top: 80px; /* 为固定导航栏留出空间 */
}

/* 轮播图样式 */
.hero-carousel {
  width: 100%;
  height: 600px;
  position: relative;
  overflow: hidden;
}

.carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slides {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.slide-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.slide-content h2 {
  font-size: 48px;
  margin-bottom: 16px;
}

.slide-content p {
  font-size: 24px;
  margin-bottom: 24px;
}

.slide-btn {
  display: inline-block;
  padding: 12px 32px;
  background: #1a237e;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.slide-btn:hover {
  background: #283593;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 20px;
  
  /* 毛玻璃效果 */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  
  /* 动画效果 */
  transition: all 0.3s ease;
  
  /* 确保按钮在轮播图上层 */
  z-index: 10;
  
  /* 内容居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-control:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.carousel-control:active {
  transform: translateY(-50%) scale(0.95);
}

.carousel-control.prev {
  left: 20px;
}

.carousel-control.next {
  right: 20px;
}

/* 优化按钮内的图标 */
.carousel-control i {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: background 0.3s ease;
}

.carousel-indicators button.active {
  background: white;
}

/* 推荐商品样式 */
.recommended-products {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 32px;
  color: #1a237e;
  margin-bottom: 12px;
}

.section-header p {
  font-size: 18px;
  color: #666;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.product-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
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
  padding: 0 8px;
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-carousel {
    height: 400px;
  }

  .slide-content h2 {
    font-size: 36px;
  }

  .slide-content p {
    font-size: 18px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hero-carousel {
    height: 300px;
  }

  .slide-content h2 {
    font-size: 28px;
  }

  .slide-content p {
    font-size: 16px;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}

/* 添加新样式 */
.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
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

/* 特色分类样式 */
.featured-categories {
  max-width: 1240px;
  margin:  60px auto;
  margin: 60px auto;
  padding: 0 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
  height: 800px;
}

.category-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover img {
  transform: scale(1.05);
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
}

.card-content h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.card-content p {
  font-size: 16px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.shop-now {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(5px);
  border-radius: 4px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.shop-now:hover {
  background: rgba(255,255,255,0.3);
}

/* 卡片尺寸定位 */
.large {
  grid-row: 1 / span 2;
  grid-column: 1;
}

.medium {
  grid-column: 2 / span 2;
  grid-row: 1;
}

.small {
  grid-row: 2;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: 1fr 1fr;
    height: auto;
  }
  
  .large {
    grid-row: auto;
    grid-column: 1 / span 2;
  }
  
  .medium {
    grid-column: 1 / span 2;
  }
  
  .small {
    grid-row: auto;
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .small {
    grid-column: 1;
  }
  
  .card-content h3 {
    font-size: 20px;
  }
}
</style>
