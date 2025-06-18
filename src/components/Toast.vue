<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-center', 'top-right', 'bottom-center', 'bottom-right'].includes(value)
  }
})

const emit = defineEmits(['close'])

const isVisible = ref(false)
let timer = null

const getIcon = () => {
  switch (props.type) {
    case 'success':
      return 'fas fa-check-circle'
    case 'error':
      return 'fas fa-exclamation-circle'
    case 'warning':
      return 'fas fa-exclamation-triangle'
    case 'info':
      return 'fas fa-info-circle'
    default:
      return 'fas fa-info-circle'
  }
}

const closeToast = () => {
  isVisible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

onMounted(() => {
  isVisible.value = true
  if (props.duration > 0) {
    timer = setTimeout(closeToast, props.duration)
  }
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<template>
  <div 
    class="toast-container" 
    :class="[position, { 'visible': isVisible }]"
  >
    <div class="toast" :class="type">
      <div class="toast-icon">
        <i :class="getIcon()"></i>
      </div>
      <div class="toast-content">
        <p>{{ message }}</p>
      </div>
      <button class="toast-close" @click="closeToast">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  pointer-events: none;
  opacity: 0;
  transition: all 0.3s ease;
}

/* 位置样式 */
.toast-container.top-center {
  top: 20px;
  left: 0;
  right: 0;
  justify-content: center;
  transform: translateY(-20px);
}

.toast-container.top-right {
  top: 20px;
  right: 20px;
  transform: translateX(20px);
}

.toast-container.bottom-center {
  bottom: 20px;
  left: 0;
  right: 0;
  justify-content: center;
  transform: translateY(20px);
}

.toast-container.bottom-right {
  bottom: 20px;
  right: 20px;
  transform: translateX(20px);
}

.toast-container.visible {
  opacity: 1;
  transform: translateY(0) translateX(0);
}

.toast {
  display: flex;
  align-items: center;
  min-width: 300px;
  max-width: 500px;
  padding: 12px 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

.toast.success {
  border-left: 4px solid #4caf50;
}

.toast.error {
  border-left: 4px solid #f44336;
}

.toast.warning {
  border-left: 4px solid #ff9800;
}

.toast.info {
  border-left: 4px solid #2196f3;
}

.toast-icon {
  margin-right: 12px;
  font-size: 20px;
}

.toast.success .toast-icon {
  color: #4caf50;
}

.toast.error .toast-icon {
  color: #f44336;
}

.toast.warning .toast-icon {
  color: #ff9800;
}

.toast.info .toast-icon {
  color: #2196f3;
}

.toast-content {
  flex: 1;
}

.toast-content p {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.toast-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  margin-left: 8px;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #333;
}
</style> 