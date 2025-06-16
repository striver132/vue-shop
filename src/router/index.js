import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import CartView from '@/views/CartView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
      meta: { requiresAuth: true }
    },
    {
      path: '/product/:id',
      name: 'product',
      component: ProductDetailView
    }
    // {
    //   path: '/shop',
    //   name: 'shop',
    //   component: () => import('@/views/ShopView.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/account',
    //   name: 'account',
    //   component: () => import('@/views/AccountView.vue'),
    //   meta: { requiresAuth: true }
    // }
  ]
})

// 简化路由守卫逻辑
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 只检查需要认证的路由
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
