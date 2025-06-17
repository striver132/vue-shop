import request from '@/utils/request'

// 获取商品列表
export function getProducts(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}

// 获取分类列表
export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

// 根据分类获取商品
export function getProductsByCategory(categoryId, params) {
  return request({
    url: '/products',
    method: 'get',
    params: {
      ...params,
      categoryId
    }
  })
}

// 搜索商品
export function searchProducts(query, params) {
  return request({
    url: '/products',
    method: 'get',
    params: {
      ...params,
      q: query
    }
  })
}