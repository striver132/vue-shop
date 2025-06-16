import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/users',
    method: 'get',
    params: {
      username: data.username,
      password: data.password
    }
  })
}

export function register(data) {
  return request({
    url: '/users',
    method: 'post',
    data: {
      username: data.username,
      password: data.password,
      email: data.email,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + data.username,
      createdAt: new Date().toISOString()
    }
  })
}

export function getUserInfo(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
} 