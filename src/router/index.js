import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import CartView from '@/views/CartView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import NotFound from '@/views/NotFound.vue'

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
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('@/views/ShopView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/order/:id',
      name: 'order-detail',
      component: () => import('@/views/OrderDetailView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/new-arrivals',
      name: 'new-arrivals',
      component: () => import('@/views/NewArrivals.vue')
    },
    // 404页面路由 - 必须放在最后
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

// 简化路由守卫逻辑
router.beforeEach((to, from, next) => {
  // 使用localStorage直接检查是否已登录，避免在路由守卫中过早使用Pinia store
  const isAuthenticated = !!localStorage.getItem('userInfo')
  
  // 只检查需要认证的路由
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    // 如果用户已登录且尝试访问登录页，重定向到首页
    if (isAuthenticated && to.path === '/login') {
      next('/')
    } else {
      next()
    }
  }
})

export default router
