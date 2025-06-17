<template>
  <nav class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="navbar-logo">
        M-777
      </router-link>

      <!-- Main Navigation -->
      <div class="navbar-links" :class="{ 'active': isMobileMenuOpen }">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/shop" class="nav-link">商城</router-link>
        <router-link to="/new-arrivals" class="nav-link">新品</router-link>
        <router-link to="/about" class="nav-link">联系我们</router-link>
      </div>

      <!-- Right Actions -->
      <div class="navbar-actions">
        <button class="action-btn" @click="toggleSearch">
          <i class="fas fa-search"></i>
        </button>
        
        <!-- 用户菜单 -->
        <div class="user-menu" v-if="userStore.isAuthenticated">
          <div class="avatar" 
               ref="userAvatarRef"
               @click="toggleUserMenu">
            <img 
              v-if="userStore.userInfo?.avatar"
              :src="userStore.userInfo.avatar"
              class="user-avatar"
              :alt="userStore.userInfo.username"
            >
            <i v-else class="fas fa-user"></i>
            <span class="username">{{ userStore.userInfo.username }}</span>
          </div>
          
          <div class="user-dropdown" 
               v-show="showUserMenu"
               ref="userMenuRef">
            <router-link to="/account" class="dropdown-item">
              <i class="fas fa-user-circle"></i>
              个人中心
            </router-link>
            <router-link to="/orders" class="dropdown-item">
              <i class="fas fa-shopping-bag"></i>
              我的订单
            </router-link>
            <router-link to="/settings" class="dropdown-item">
              <i class="fas fa-cog"></i>
              账号设置
            </router-link>
            <button @click="handleLogout" class="dropdown-item logout">
              <i class="fas fa-sign-out-alt"></i>
              退出登录
            </button>
          </div>
        </div>
        
        <!-- 未登录状态 -->
        <router-link 
          v-else 
          to="/login" 
          class="action-btn"
        >
          <i class="fas fa-user"></i>
        </router-link>

        <router-link to="/cart" class="action-btn cart-btn">
          <i class="fas fa-shopping-cart"></i>
          <span v-if="cartStore.totalCount > 0" class="cart-count">
            {{ cartStore.totalCount }}
          </span>
        </router-link>
        
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- Search Overlay -->
    <div class="search-overlay" v-if="isSearchOpen" @click="closeSearch">
      <div class="search-container" @click.stop>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="搜索商品..."
          @keyup.enter="handleSearch"
        >
        <button @click="handleSearch">
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

export default defineComponent({
  name: 'Navbar',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const isScrolled = ref(false)
    const isMobileMenuOpen = ref(false)
    const isSearchOpen = ref(false)
    const searchQuery = ref('')
    const showUserMenu = ref(false)
    const userMenuRef = ref(null)
    const userAvatarRef = ref(null)

    // 处理滚动效果
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50
    }

    // 切换移动端菜单
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    // 搜索相关功能
    const toggleSearch = () => {
      isSearchOpen.value = !isSearchOpen.value
      if (isSearchOpen.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    const closeSearch = () => {
      isSearchOpen.value = false
      document.body.style.overflow = ''
    }

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          path: '/search',
          query: { q: searchQuery.value }
        })
        closeSearch()
      }
    }

    // 处理登出
    const handleLogout = () => {
      userStore.logout()
      cartStore.clearCart()
      router.push('/login')
    }

    // 处理点击外部关闭
    const handleClickOutside = (event) => {
      if (userMenuRef.value && userAvatarRef.value && 
          !userMenuRef.value.contains(event.target) && 
          !userAvatarRef.value.contains(event.target)) {
        showUserMenu.value = false
      }
    }

    // 切换菜单显示状态
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }

    // 生命周期钩子
    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      if (userStore.isAuthenticated) {
        cartStore.fetchCartList()
      }
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      isScrolled,
      isMobileMenuOpen,
      isSearchOpen,
      searchQuery,
      showUserMenu,
      userStore,
      cartStore,
      toggleMobileMenu,
      toggleSearch,
      closeSearch,
      handleSearch,
      handleLogout,
      userMenuRef,
      userAvatarRef,
      toggleUserMenu
    }
  }
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar-scrolled {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 70px;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  font-size: 24px;
  font-weight: 700;
  color: #1a237e;
  text-decoration: none;
  letter-spacing: 1px;
}

.navbar-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #1a237e;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-btn {
  background: none;
  border: none;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  position: relative;
  transition: color 0.3s ease;
}

.action-btn:hover {
  color: #1a237e;
}

.cart-btn {
  position: relative;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f44336;
  color: white;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.mobile-menu-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: #333;
  transition: all 0.3s ease;
}

.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.search-container {
  width: 80%;
  max-width: 600px;
  display: flex;
  gap: 10px;
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.search-container input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search-container button {
  padding: 12px 24px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.search-container button:hover {
  background: #283593;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-links {
    position: fixed;
    top: 80px;
    left: 0;
    width: 100%;
    flex-direction: column;
    background: white;
    padding: 20px;
    gap: 20px;
    transform: translateY(-100%);
    transition: transform 0.3s ease;
    z-index: 900;
  }

  .navbar-links.active {
    transform: translateY(0);
  }

  .mobile-menu-btn {
    display: flex;
  }
}

/* 添加新样式 */
.user-menu {
  position: relative;
}

.avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.avatar:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  color: #333;
  font-size: 14px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  margin-top: 8px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item i {
  font-size: 16px;
  color: #666;
}

.dropdown-item.logout {
  color: #f44336;
}

.dropdown-item.logout i {
  color: #f44336;
}

/* 添加三角形指示器 */
.user-dropdown::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 20px;
  width: 16px;
  height: 16px;
  background: white;
  transform: rotate(45deg);
  box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.05);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-dropdown {
    width: 180px;
  }

  .username {
    display: none;
  }
}
</style> 