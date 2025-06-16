<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProductDetail } from '@/api/cart'

const route = useRoute()
const productId = route.params.id

const product = ref(null)
const loading = ref(true)
const error = ref('')
const selectedImage = ref('')
const selectedSize = ref('')
const addToCartLoading = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    const res = await getProductDetail(productId)
    console.log(res);
    console.log('res');

    
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
const handleAddToCart = () => {
  addToCartLoading.value = true
  setTimeout(() => {
    addToCartLoading.value = false
    alert('已加入购物车！')
  }, 800)
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
          <div class="size-select">
            <div class="label">尺码</div>
            <div class="size-options">
              <button 
                v-for="size in [38,39,40,41,42,43,44,45]" 
                :key="size"
                :class="['size-btn', { selected: selectedSize === size }]"
                @click="handleSelectSize(size)">
                {{ size }}
              </button>
            </div>
          </div>
          <button class="add-cart-btn" :disabled="addToCartLoading" @click="handleAddToCart">
            <span v-if="addToCartLoading">加入中...</span>
            <span v-else><i class="fas fa-shopping-cart"></i> 加入购物车</span>
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
}
.add-cart-btn:disabled {
  background: #9fa8da;
  cursor: not-allowed;
}
.add-cart-btn i {
  margin-right: 8px;
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
</style> 