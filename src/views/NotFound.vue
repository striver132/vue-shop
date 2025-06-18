<template>
  <div class="not-found">
    <div class="container">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <router-link to="/" class="home-btn">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
// 404页面不需要特殊逻辑
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  text-align: center;
  padding: 0 20px;
}

.container {
  max-width: 600px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #1a237e;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 2px 2px 8px rgba(26, 35, 126, 0.2);
}

h1 {
  font-size: 32px;
  margin-bottom: 16px;
  color: #333;
}

p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.home-btn {
  display: inline-block;
  background-color: #1a237e;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s, transform 0.2s;
}

.home-btn:hover {
  background-color: #303f9f;
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .error-code {
    font-size: 100px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  p {
    font-size: 16px;
  }
}
</style> 