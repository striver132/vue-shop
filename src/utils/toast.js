import { createVNode, render } from 'vue'
import Toast from '@/components/Toast.vue'

let toastContainer = null
let toasts = []
let toastId = 0

// 创建容器
const createContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.className = 'toast-wrapper'
    document.body.appendChild(toastContainer)
  }
}

// 显示提示
const showToast = (options) => {
  createContainer()

  const id = toastId++
  const props = {
    ...options,
    id
  }

  // 创建 Toast 实例
  const vnode = createVNode(Toast, {
    ...props,
    onClose: () => removeToast(id)
  })

  // 创建容器并渲染
  const container = document.createElement('div')
  render(vnode, container)
  toastContainer.appendChild(container)

  // 添加到队列
  toasts.push({ id, container })

  return id
}

// 移除提示
const removeToast = (id) => {
  const index = toasts.findIndex(toast => toast.id === id)
  if (index !== -1) {
    const { container } = toasts[index]
    toastContainer.removeChild(container)
    render(null, container)
    toasts.splice(index, 1)
  }
}

// 快捷方法
export const toast = {
  success(message, options = {}) {
    return showToast({ message, type: 'success', ...options })
  },
  error(message, options = {}) {
    return showToast({ message, type: 'error', ...options })
  },
  warning(message, options = {}) {
    return showToast({ message, type: 'warning', ...options })
  },
  info(message, options = {}) {
    return showToast({ message, type: 'info', ...options })
  },
  show(options) {
    return showToast(options)
  },
  close(id) {
    removeToast(id)
  },
  closeAll() {
    toasts.forEach(toast => removeToast(toast.id))
  }
}

export default toast 