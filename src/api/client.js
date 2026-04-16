import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

// 요청 인터셉터 - 액세스 토큰 자동 첨부
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 응답 인터셉터 - 401 시 리프레시 토큰으로 자동 갱신1
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(
          `${BASE_URL}/api/user/refresh`,
          {},
          { headers: { 'Refresh-Token': refreshToken, 'ngrok-skip-browser-warning': 'true' } }
        )
        const { accessToken, refreshToken: newRefreshToken } = res.data
        localStorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return client(originalRequest)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default client
