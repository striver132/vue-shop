import request from '@/utils/request'

export function getCarousels() {
  return request({
    url: '/carousels',
    method: 'get'
  })
}

export function getRecommendedProducts() {
  return request({
    url: '/products',
    method: 'get',
    params: {
      isRecommended: true
    }
  })
}

export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
} 