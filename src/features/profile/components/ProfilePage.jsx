import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ProfilePage.module.css'
import client from '../../../api/client'

export default function ProfilePage() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') || ''

  const [form, setForm] = useState({
    organizationId: '',
    position: '',
    departmentId: '',
    portfolio: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await client.get('/api/user/profile')
        const data = res.data
        setForm({
          organizationId: data.organizationId || '',
          position: data.position || '',
          departmentId: data.departmentId || '',
          portfolio: data.portfolio || '',
        })
      } catch (error) {
        alert('프로필을 불러오는데 실패했습니다.')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await client.put('/api/user/profile', {
        organizationId: form.organizationId,
        departmentId: form.departmentId,
        position: form.position,
        portfolio: form.portfolio,
      })
      alert('프로필이 저장됐습니다!')
      navigate('/dashboard', { state: { openProfile: true } })
    } catch (error) {
      alert('저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return <div>로딩 중...</div>

  return (
    <div className={styles.container}>

      {/* 7. 헤더 - 로고 눌러서 돌아가기 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: 'linear-gradient(135deg, #3BBFD4, #1E9CB5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
            }}>🤖</div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F2A31' }}>AI PM</span>
            <span style={{ fontSize: '9px', fontWeight: 600, background: '#3BBFD4', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>BETA</span>
          </div>
          <div>
            <h1 className={styles.headerTitle}>내 정보</h1>
            <p className={styles.headerSub}>프로필 및 계정 설정</p>
          </div>
        </div>
      </header>

      <div className={styles.content}>

        {/* 프로필 카드 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>프로필 정보</span>
          </div>
          <div className={styles.cardBody}>

            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {nickname.charAt(0) || '?'}
              </div>
              <div>
                <div className={styles.avatarName}>{nickname}</div>
                <label className={styles.avatarBtn} htmlFor="profileImg">
                  사진 변경
                </label>
                <input
                  id="profileImg"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>소속 회사</label>
                  <input
                    type="text"
                    name="organizationId"
                    value={form.organizationId}
                    onChange={handleChange}
                    placeholder="소속 회사명"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>직급</label>
                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="예: 사원, 대리, 과장"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>부서</label>
                <input
                  type="text"
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  placeholder="예: 개발팀, 디자인팀"
                />
              </div>
              <div className={styles.formGroup}>
                <label>포트폴리오</label>
                <textarea
                  name="portfolio"
                  value={form.portfolio}
                  onChange={handleChange}
                  placeholder="자기소개 및 포트폴리오를 입력하세요"
                  rows={4}
                />
              </div>
              <div className={styles.btnRight}>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 8. 비밀번호 변경 카드 제거 */}

      </div>
    </div>
  )
}