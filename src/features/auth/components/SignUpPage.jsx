import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SignUpPage.module.css'
import { BASE_URL } from '../../../api/config'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nickname: '',
    userId: '',
    password: '',
    passwordConfirm: '',
    email: '',
    name: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setServerError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = '이름을 입력해주세요.'
    if (!form.nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요.'
    if (!form.email.trim()) newErrors.email = '이메일을 입력해주세요.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = '올바른 이메일 형식이 아닙니다.'
    if (!form.userId.trim()) newErrors.userId = '아이디를 입력해주세요.'
    else if (!/^[a-zA-Z0-9]+$/.test(form.userId)) newErrors.userId = '영문, 숫자만 사용 가능합니다.'
    if (!form.password) newErrors.password = '비밀번호를 입력해주세요.'
    else if (form.password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다.'
    if (!form.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.'
    else if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          userId: form.userId,
          email: form.email,
          password: form.password,
          name: form.name,
          nickname: form.nickname,
        })
      })

      if (!response.ok) {
        setServerError('회원가입에 실패했습니다. 이미 사용 중인 아이디 또는 이메일일 수 있습니다.')
        return
      }

      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      setServerError('서버 연결에 실패했습니다.')
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
          <h2 className={styles.cardTitle} style={{ textAlign: 'center' }}>회원가입</h2>

          {/* 서버 오류 메시지 */}
          {serverError && (
            <div className={styles.serverError}>
              ⚠️ {serverError}
            </div>
          )}

          {/* 성공 메시지 */}
          {success && (
            <div className={styles.serverSuccess}>
              ✅ 회원가입이 완료됐습니다! 로그인 페이지로 이동합니다...
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>닉네임</label>
              <input
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
                className={errors.nickname ? styles.inputError : ''}
              />
              {errors.nickname && <span className={styles.errorMsg}>{errors.nickname}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>이메일</label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>아이디</label>
              <input
                type="text"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="영문, 숫자 조합"
                className={errors.userId ? styles.inputError : ''}
              />
              {errors.userId && <span className={styles.errorMsg}>{errors.userId}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>비밀번호</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요 (6자 이상)"
                className={errors.password ? styles.inputError : ''}
              />
              {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>비밀번호 확인</label>
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                className={errors.passwordConfirm ? styles.inputError : ''}
              />
              {errors.passwordConfirm && <span className={styles.errorMsg}>{errors.passwordConfirm}</span>}
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