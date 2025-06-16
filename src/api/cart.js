import request from '@/utils/request'

// 获取商品详情
export function getProductDetail(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  })
}

// 获取购物车列表
export function getCartList(userId) {
  return request({
    url: '/cart',
    method: 'get',
    params: { userId }
  })
}

// 添加到购物车
export function addToCart(data) {
  return request({
    url: '/cart',
    method: 'post',
    data
  })
}

// 更新购物车商品数量
export function updateCartItem(id, data) {
  return request({
    url: `/cart/${id}`,
    method: 'put',
    data
  })
}

// 删除购物车商品
export function removeFromCart(id) {
  return request({
    url: `/cart/${id}`,
    method: 'delete'
  })
} 

