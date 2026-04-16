import client from '../../../api/client'

export const login = async (email, password) => {
  const response = await client.post('/api/user/login', { email, password })
  return response.data
}

export const signup = async (data) => {
  const response = await client.post('/api/user/register', data)
  return response.data
}