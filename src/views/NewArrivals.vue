<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProductDetail } from '@/api/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 新品数据
const newArrivals = ref([
  {
    id: '1',
    title: 'Breaking Bad',
    description: '化学教师华特·怀特被诊断出肺癌晚期，为了给家人留下财富，他开始制造和贩卖甲基苯丙胺。',
    image: '/n1.png',
    rating: 9.4,
    type: 'TV Series'
  },
  {
    id: '2',
    title: 'Mr. Robot',
    description: '跟随一位年轻的计算机程序员，他患有社交焦虑症，通过黑客建立联系。他被一位神秘的无政府主义者招募，此人自称为"机器人先生"。',
    image: '/n2.png',
    rating: 9.5,
    type: 'TV Series'
  },
  {
    id: '3',
    title: 'Our Democracy Has Been Hacked',
    description: '一个关于黑客、阴谋和社会革命的惊悚故事，探讨了技术与社会控制的复杂关系。',
    image: 'https://m.media-amazon.com/images/M/MV5BMzgxMmQxZjQtNDdmMC00MjRlLTk1MDEtZDcwNTdmOTg0YzA2XkEyXkFqcGdeQXVyMzQ2MDI5NjU@._V1_.jpg',
    rating: 9.2,
    type: 'TV Series'
  },
  {
    id: '4',
    title: 'The Matrix',
    description: '一名黑客了解到他所知道的现实是一个由被称为"矩阵"的复杂计算机系统创造的虚拟世界。',
    image: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
    rating: 8.7,
    type: 'Movie'
  },
  {
    id: '5',
    title: 'Inception',
    description: '一个窃贼有能力进入人们的梦境并窃取他们的秘密，他被要求植入一个想法到一个目标的潜意识中。',
    image: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    rating: 8.8,
    type: 'Movie'
  }
])

// 当前轮播图索引
const currentSlide = ref(0)
// 当前选中的项目
const selectedItem = ref(newArrivals.value[0])
// 显示的项目数量
const displayCount = 3

// 计算可见的轮播项
const visibleItems = computed(() => {
  const items = [...newArrivals.value]
  // 将当前项放在中间
  const start = Math.max(0, currentSlide.value - Math.floor(displayCount / 2))
  const end = Math.min(items.length, start + displayCount)
  return items.slice(start, end)
})

// 轮播图控制函数
const nextSlide = () => {
  if (currentSlide.value < newArrivals.value.length - 1) {
    currentSlide.value++
    selectedItem.value = newArrivals.value[currentSlide.value]
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
    selectedItem.value = newArrivals.value[currentSlide.value]
  }
}

const selectSlide = (index) => {
  currentSlide.value = index
  selectedItem.value = newArrivals.value[index]
}

// 自动轮播
let autoplayInterval
const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    if (currentSlide.value >= newArrivals.value.length - 1) {
      currentSlide.value = 0
    } else {
      currentSlide.value++
    }
    selectedItem.value = newArrivals.value[currentSlide.value]
  }, 5000)
}

const stopAutoplay = () => {
  clearInterval(autoplayInterval)
}

// 组件挂载时启动自动轮播
onMounted(() => {
  startAutoplay()
  // 这里可以添加从API获取新品数据的逻辑
})

// 组件卸载时清除定时器
onUnmounted(() => {
  stopAutoplay()
})

// 检查登录状态并处理导航
const handleNavigation = (path) => {
  if (!userStore.isAuthenticated) {
    localStorage.setItem('redirectPath', path)
    router.push('/login')
    return false
  }
  return true
}
</script>

<template>
  <main class="new-arrivals">
    <div class="section-header">
      <h1>新品上市</h1>
      <p>发现最新上架的精选商品</p>
    </div>
    
    <!-- 轮播图部分 -->
    <section class="carousel-section" 
      @mouseenter="stopAutoplay" 
      @mouseleave="startAutoplay">
      
      <div class="carousel-container">
        <!-- 左侧控制按钮 -->
        <button 
          class="carousel-control prev" 
          @click="prevSlide"
          :disabled="currentSlide === 0">
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <!-- 轮播项目 -->
        <div class="carousel-items">
          <div 
            v-for="(item, index) in visibleItems" 
            :key="item.id"
            :class="[
              'carousel-item', 
              { 
                'active': index === Math.floor(visibleItems.length / 2),
                'left': index < Math.floor(visibleItems.length / 2),
                'right': index > Math.floor(visibleItems.length / 2)
              }
            ]"
            @click="selectSlide(currentSlide - Math.floor(displayCount / 2) + index)"
          >
            <div class="item-card">
              <img :src="item.image" :alt="item.title">
              <div class="item-overlay" v-if="index === Math.floor(visibleItems.length / 2)">
                <div class="item-type">{{ item.type }}</div>
                <div class="item-rating">{{ item.rating }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧控制按钮 -->
        <button 
          class="carousel-control next" 
          @click="nextSlide"
          :disabled="currentSlide === newArrivals.length - 1">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <!-- 当前选中项目详情 -->
      <div class="selected-item-details">
        <h2>{{ selectedItem.title }}</h2>
        <p>{{ selectedItem.description }}</p>
        <div class="item-meta">
          <span class="item-type">{{ selectedItem.type }}</span>
          <span class="item-rating">
            <i class="fas fa-star"></i>
            {{ selectedItem.rating }}
          </span>
        </div>
        <button class="view-details-btn" @click="handleNavigation(`/product/${selectedItem.id}`) && router.push(`/product/${selectedItem.id}`)">
          查看详情
        </button>
      </div>
      
      <!-- 指示器 -->
      <div class="carousel-indicators">
        <button 
          v-for="(item, index) in newArrivals" 
          :key="item.id"
          :class="{ active: currentSlide === index }"
          @click="selectSlide(index)">
        </button>
      </div>
    </section>
    
    <!-- 新品推荐部分
    <section class="new-products">
      <div class="section-subheader">
        <h2>全部新品</h2>
        <p>浏览所有最新上架的商品</p>
      </div>
      
      <div class="products-grid">
        <div 
          v-for="item in newArrivals" 
          :key="item.id"
          class="product-card"
          @click="handleNavigation(`/product/${item.id}`) && router.push(`/product/${item.id}`)"
        >
          <div class="product-image">
            <img :src="item.image" :alt="item.title">
            <div class="product-badge">NEW</div>
          </div>
          <div class="product-info">
            <h3>{{ item.title }}</h3>
            <div class="product-meta">
              <span class="product-type">{{ item.type }}</span>
              <span class="product-rating">
                <i class="fas fa-star"></i>
                {{ item.rating }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section> -->
  </main>
</template>

<style scoped>
.new-arrivals {
  padding-top: 80px; /* 为固定导航栏留出空间 */
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.section-header {
  text-align: center;
  margin: 40px 0;
}

.section-header h1 {
  font-size: 36px;
  color: #1a237e;
  margin-bottom: 12px;
}

.section-header p {
  font-size: 18px;
  color: #666;
}

/* 轮播图样式 */
.carousel-section {
  position: relative;
  margin: 60px auto;
  padding: 0 20px;
}

.carousel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 400px;
}

.carousel-items {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-item {
  position: relative;
  transition: all 0.5s ease;
  cursor: pointer;
}

.carousel-item.active {
  transform: scale(1.2);
  z-index: 10;
}

.carousel-item.left {
  transform: translateX(-50px) scale(0.8);
  opacity: 0.7;
}

.carousel-item.right {
  transform: translateX(50px) scale(0.8);
  opacity: 0.7;
}

.item-card {
  position: relative;
  width: 250px;
  height: 350px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.item-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  color: white;
}

.item-type {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.item-rating {
  font-size: 20px;
  font-weight: 600;
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
  z-index: 20;
  
  /* 内容居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-control:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.carousel-control:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-control.prev {
  left: 20px;
}

.carousel-control.next {
  right: 20px;
}

/* 当前选中项目详情 */
.selected-item-details {
  text-align: center;
  margin-top: 40px;
  padding: 0 20px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.selected-item-details h2 {
  font-size: 28px;
  color: #1a237e;
  margin-bottom: 16px;
}

.selected-item-details p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.item-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.view-details-btn {
  padding: 12px 32px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.view-details-btn:hover {
  background: #283593;
}

/* 指示器样式 */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #1a237e;
  background: transparent;
  cursor: pointer;
  transition: background 0.3s ease;
}

.carousel-indicators button.active {
  background: #1a237e;
}

/* 新品推荐部分 */
.new-products {
  margin-top: 80px;
}

.section-subheader {
  text-align: center;
  margin-bottom: 40px;
}

.section-subheader h2 {
  font-size: 28px;
  color: #1a237e;
  margin-bottom: 12px;
}

.section-subheader p {
  font-size: 16px;
  color: #666;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  padding: 0 20px;
}

.product-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f44336;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.product-info {
  padding: 16px 8px;
}

.product-info h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

.product-rating {
  color: #fbc02d;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .carousel-container {
    height: 350px;
  }
  
  .item-card {
    width: 200px;
    height: 280px;
  }
  
  .carousel-item.left,
  .carousel-item.right {
    display: none;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .carousel-container {
    height: 300px;
  }
  
  .item-card {
    width: 180px;
    height: 250px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .selected-item-details h2 {
    font-size: 24px;
  }
}
</style>
