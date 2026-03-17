import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SignupPage.module.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSignup = (e) => {
    e.preventDefault()
    if (form.password !== form.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/login')
    }, 1200)
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrap}>

        <div className={styles.logo}>
          <div className={styles.logoIcon}>🤖</div>
          <h1 className={styles.logoTitle}>AI PM</h1>
          <p className={styles.logoSub}>AI가 PM 역할을 대신해드립니다</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>회원가입</h2>

          <form onSubmit={handleSignup} className={styles.form}>
            <div className={styles.formGroup}>
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="홍길동"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>이메일</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
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
            <div className={styles.formGroup}>
              <label>비밀번호 확인</label>
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <p className={styles.switchText}>
            이미 계정이 있으신가요?{' '}
            <button onClick={() => navigate('/login')}>로그인</button>
          </p>
        </div>

      </div>
    </div>
  )
}