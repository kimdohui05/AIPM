import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1200)
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
              <label>이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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