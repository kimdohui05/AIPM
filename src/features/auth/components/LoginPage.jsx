import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'
import { BASE_URL } from '../../../api/config'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ id: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ userId: form.id, password: form.password })      
      })

      if (!response.ok) {
        alert('ID 또는 비밀번호가 올바르지 않습니다.')
        return
      }

      const data = await response.json()
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('uuid', data.uuid)
      localStorage.setItem('nickname', data.nickname)
      navigate('/dashboard')
    } catch (err) {
      alert('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrap}>

        <div className={styles.logo}>
          <h1 className={styles.logoTitle}>AI PM</h1>
          <p className={styles.logoSub}>AI가 PM 역할을 대신해드립니다</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>로그인</h2>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label>ID</label>
              <input
                type="id"
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="ID을 입력하세요"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>비밀번호</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className={styles.switchText}>
            계정이 없으신가요?{' '}
            <button onClick={() => navigate('/signup')}>회원가입</button>
          </p>
        </div>

      </div>
    </div>
  )
}