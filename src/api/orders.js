import request from '@/utils/request'

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise} 返回创建的订单
 */
export function createOrder(orderData) {
  return request({
    url: '/orders',
    method: 'post',
    data: {
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'pending' // 初始状态为待支付
    }
  })
}

/**
 * 直接购买商品（跳过购物车）
 * @param {Object} orderData - 订单数据
 * @returns {Promise} 返回创建的订单
 */
export function buyNow(orderData) {
  return request({
    url: '/orders',
    method: 'post',
    data: orderData
  })
}

/**
 * 获取用户订单列表
 * @param {number} userId - 用户ID
 * @returns {Promise} 返回订单列表
 */
export function getUserOrders(userId) {
  return request({
    url: '/orders',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取订单详情
 * @param {string} orderId - 订单ID
 * @returns {Promise} 返回订单详情
 */
export function getOrderDetail(orderId) {
  return request({
    url: `/orders/${orderId}`,
    method: 'get'
  })
}

/**
 * 更新订单状态（支付）
 * @param {string} orderId - 订单ID
 * @param {string} status - 订单状态
 * @returns {Promise} 返回更新后的订单
 */
export function updateOrderStatus(orderId, status) {
  return request({
    url: `/orders/${orderId}`,
    method: 'patch',
    data: { 
      status,
      updatedAt: new Date().toISOString()
    }
  })
}

/**
 * 删除订单
 * @param {string} orderId - 订单ID
 * @returns {Promise} 返回删除结果
 */
export function deleteOrder(orderId) {
  return request({
    url: `/orders/${orderId}`,
    method: 'delete'
  })
}

