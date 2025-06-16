<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const success = await userStore.login(loginForm.value)
    if (success) {
      router.push('/')
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJUAAACUCAMAAACtIJvYAAAAMFBMVEW+vr7///+7u7v4+PjBwcHExMS4uLjJycnx8fHS0tLNzc319fXi4uLb29v7+/vm5uZKzrmxAAAFt0lEQVR4nNWcyaKkIAxF44TiUP7/3zagVU4M4aI++m56VfZ5IUBIAlQkqeq6eZxk3zSk1bS9nMa566q0zxL+026UbUNClCXtVJalEApPjt3bVFU3tWeckzRcO4FGQ6hm2ZCXaCOjRs4vUH1mqQYoRkLI+fMoVTUpK0UxGZNRM8WNZAyVMlM80gomokaST9W1gJn2Bmv5k5JLNfdx3mST6Ln24lENfZKdNnv1w21UlWStAyyukuX3DKp5vovJcNWMYQxSDTc41FEiPIwhqvkWhzqqpJC5AlTybkMtEjKBqrvVo/Yqa+/i5aMan2IyXCNGNT0JpbAmhEo+C6Ww3M7loqrap6EUVutaUR1Ub0BpLEfgZacaHpt8J6zavqBaqT6vWMpg2a1lo6qat6AUVmPzLRtV/x6Uwup5VK9C2bGuVA8vnhas63J6oXodyrb5nKm696EU1nmrPlFV9R9AEdWVl+plT//q7PFHqvGZIC8sMbqpur8ZP61jFHiggjcanbKqa/MP+oXWRQXGniYdNFRKQzfLGjw7HpaHHdUAjZ+op+O+P4Bn2n34sKNC5l9J8rrpD5An7OfhRtUBPlE29qPKDFCR2L61UbUAVO8KcaEz2+bwP6oZyOHZgpDvKMZDUfk7Uv+oAFd3Rd2LtQCs+kw1x3tV6c/5AF8UX2OtVJ94r/IefrWAmfi1/koFeFUTSlcDQdHXs1aqB0wFnb7bPdUA+EAQChkAMeyo4v8qT5JgEzCEcqOqmuifC06SWkZ/lpbjIYGmJk6KGllu5h8VsC9bj7xnAVvrsl9oqg+wL3s2m01IbCQ+KxUQ7bGcHfHXZcXRVD3w28eozCgoqgH5i1hUwD6mPHYwVMgMfJBKz0LCMgsPjqBOhigq4JfegG8T4hsmylJU0BnOG/F9hUR+ZoclZAGm51ZRMpsZoQkrThEZS1soxyJktSLm7gxmePqCoNn7WCRj1H4IO8crrDAUmjesB8LmyeGk6xKcYu0Im4KcIQR9Q/sswem94NoAJ37FSLCZg7MQzrGWE+HFydoPNcAfLiUBEf/3x35jJdRiJaEuSaHsR0KOvCVoW18kfMfnlBJjk0Lly8okdR00lJJid0dZaZWXxLS/cPUkpIxAui7VqkXJ5bxEa1mXhymxHFQnebumsqyl+Pq5Km0OGqzrGCZ3/TQpq+ii6xAme1WbsOM4qZL7fmTC7rzIMoKptlK7c+Inyubq7UiK4PDNCY/6lg9YT2CJbTYqFkUjZPNzktZE5GeqU/5W0cGnCV1CHZ27czWn9FJ38Mkr2OrcwX3C6uSFnUTKhnF2/kjMXuqUCp3off2Lew1QF2wPZT/cXYIWrvgOM5P9iJ6E3sD4qjHWvUymKDKr5iqAe8wVeTA0WbW42q6IGL2f4ryrjs7Wct38pJg9aM3WRvwEhIpqcFgz2/xML6N+6lLFXrrWKgB7xYItpcXe2daKCTeidR6zeGJG87/qEq8Sx0v8e8T743+VOF6miZX392Mx/vqtasmahYJ368grxu6zq/AyqkAJ028To6VnVw1nnEos4Tmg4IK97xwId1kw8tgshf74Q5dFqCPl2KGYoJCxDh0pQX+/yVShqv2peycQJ99lqtA+cup08sd+t0xAxv9z7grzR1ki8QL6Xj6qSwed17PuWRYWec7Vlm5DzzTkFeSZ8sxCS2emp0h8o1v59mhrF6t7gQ+URuLk9JT9iHC6o9+hcnRHu407V/fJFcELRye5e37Ud8oxHs6u+0xvKOR5myPTmy+Z3hLK80bV39w+uxw0/5Obepneasz0Bmimt2XzvFmc6S3st6wVeWM909v9RZ4vIRSZvhqR6Qsbmb5GUuT5ckuR6Ss3mb4IVOT5elKhX5q6zVz3vTRV5Pkql1aOL5hp5fjam1aOL+Np5fiKoFaOLy4uyu91ykU5vuS5yv7qKf3dq6c/fV+IbU0tr77rhdh/ElM8ynqBgHgAAAAASUVORK5CYII=" alt="用户头像">
      </div>

      <!-- 登录表单 -->
      <h2>登录</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 用户名输入框 -->
        <div class="form-group">
          <input 
            type="text" 
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :disabled="loading"
          >
        </div>

        <!-- 密码输入框 -->
        <div class="form-group">
          <input 
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            :disabled="loading"
          >
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 登录按钮 -->
        <button 
          type="submit" 
          class="login-btn"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <!-- 其他选项 -->
        <div class="form-footer">
          <button 
            type="button"
            class="register-btn"
            @click="handleRegister"
          >
            注册账号
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h2 {
  color: #1a237e;
  margin-bottom: 30px;
  font-weight: 600;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #1a237e;
  outline: none;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-btn:hover {
  background: #283593;
}

.login-btn:disabled {
  background: #9fa8da;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.register-btn {
  background: none;
  border: none;
  color: #1a237e;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.3s ease;
}

.register-btn:hover {
  opacity: 0.8;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
}
</style> 