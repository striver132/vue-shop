import request from '@/utils/request'

/**
 * 搜索商品
 * @param {string} keyword - 搜索关键词
 * @returns {Promise} 返回搜索结果
 */
export function searchProducts(keyword) {
  return request({
    url: '/products',
    method: 'get',
    params: {
      name_like: keyword, // 使用name_like进行模糊查询
      _limit: 10 // 限制返回结果数量
    }
  })
}

/**
 * 按分类搜索商品
 * @param {string} keyword - 搜索关键词
 * @param {number} categoryId - 分类ID
 * @returns {Promise} 返回搜索结果
 */
export function searchProductsByCategory(keyword, categoryId) {
  return request({
    url: '/products',
    method: 'get',
    params: {
      name_like: keyword, // 使用name_like进行模糊查询
      categoryId: categoryId,
      _limit: 10
    }
  })
}
