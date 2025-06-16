<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- 主要内容区 -->
      <div class="footer-content">
        <!-- 品牌区域 -->
        <div class="footer-brand">
          <router-link to="/" class="footer-logo">
            M-777
          </router-link>
          <p class="brand-description">
            致力于为您提供优质的购物体验，精选商品，品质保证。
          </p>
          <div class="social-links">
            <a href="#" class="social-link">
              <i class="fab fa-weixin"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-weibo"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="footer-links">
          <h3>快速链接</h3>
          <ul>
            <li><router-link to="/about">关于我们</router-link></li>
            <li><router-link to="/new-arrivals">新品上市</router-link></li>
            <li><router-link to="/best-sellers">热销商品</router-link></li>
            <li><router-link to="/promotions">优惠活动</router-link></li>
          </ul>
        </div>

        <!-- 帮助中心 -->
        <div class="footer-links">
          <h3>帮助中心</h3>
          <ul>
            <li><router-link to="/shipping">配送信息</router-link></li>
            <li><router-link to="/returns">退换政策</router-link></li>
            <li><router-link to="/size-guide">尺码指南</router-link></li>
            <li><router-link to="/faq">常见问题</router-link></li>
          </ul>
        </div>

        <!-- 联系我们 -->
        <div class="footer-contact">
          <h3>联系我们</h3>
          <ul>
            <li>
              <i class="fas fa-phone"></i>
              <span>客服热线：400-123-4567</span>
            </li>
            <li>
              <i class="fas fa-envelope"></i>
              <span>邮箱：support@M-777.com</span>
            </li>
            <li>
              <i class="fas fa-clock"></i>
              <span>服务时间：09:00 - 21:00</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 订阅区域 -->
      <div class="newsletter">
        <h3>订阅我们</h3>
        <p>订阅最新商品信息和独家优惠</p>
        <div class="newsletter-form">
          <input 
            type="email" 
            v-model="email" 
            placeholder="请输入您的邮箱"
            @keyup.enter="handleSubscribe"
          >
          <button @click="handleSubscribe">
            订阅
          </button>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="footer-bottom">
        <div class="footer-info">
          <p>&copy; {{ currentYear }} M-777. All rights reserved.</p>
          <div class="footer-bottom-links">
            <router-link to="/privacy">隐私政策</router-link>
            <router-link to="/terms">使用条款</router-link>
          </div>
        </div>
        <div class="payment-methods">
          <i class="fab fa-alipay"></i>
          <i class="fab fa-weixin"></i>
          <i class="fab fa-cc-visa"></i>
          <i class="fab fa-cc-mastercard"></i>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'Footer',
  setup() {
    const email = ref('')
    
    const currentYear = computed(() => {
      return new Date().getFullYear()
    })

    const handleSubscribe = () => {
      if (email.value && email.value.includes('@')) {
        // 这里添加订阅逻辑
        alert('订阅成功！')
        email.value = ''
      } else {
        alert('请输入有效的邮箱地址')
      }
    }

    return {
      email,
      currentYear,
      handleSubscribe
    }
  }
})
</script>

<style scoped>
.footer {
  background: #1a237e;
  color: white;
  padding: 60px 0 0;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  color: white;
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 1px;
  margin-bottom: 20px;
  display: inline-block;
}

.brand-description {
  color: rgba(255, 255, 255, 0.8);
  margin: 20px 0;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.social-link {
  color: white;
  font-size: 20px;
  transition: opacity 0.3s ease;
}

.social-link:hover {
  opacity: 0.8;
}

.footer-links h3,
.footer-contact h3 {
  color: white;
  font-size: 18px;
  margin-bottom: 20px;
}

.footer-links ul,
.footer-contact ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-contact li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.footer-contact i {
  font-size: 16px;
}

.newsletter {
  padding: 40px 0;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.newsletter h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.newsletter p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.newsletter-form {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  gap: 10px;
}

.newsletter-form input {
  flex: 1;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
}

.newsletter-form input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.newsletter-form button {
  padding: 12px 30px;
  background: white;
  color: #1a237e;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.3s ease;
}

.newsletter-form button:hover {
  background: rgba(255, 255, 255, 0.9);
}

.footer-bottom {
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 40px;
}

.footer-bottom-links {
  display: flex;
  gap: 20px;
}

.footer-bottom-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: white;
}

.payment-methods {
  display: flex;
  gap: 15px;
  font-size: 24px;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-brand {
    grid-column: 1 / -1;
    max-width: none;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-contact li {
    justify-content: center;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .footer-info {
    flex-direction: column;
    gap: 20px;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-form button {
    width: 100%;
  }
}
</style> 