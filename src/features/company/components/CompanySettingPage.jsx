import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CompanySettingPage.module.css'

const INITIAL_POSITIONS = ['사원', '주임', '대리', '과장', '차장', '부장', '이사', '대표']
const INITIAL_DEPARTMENTS = ['개발팀', '디자인팀', '기획팀', '마케팅팀', '인사팀', '재무팀']

export default function CompanySettingPage() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('대림대학교')
  const [positions, setPositions] = useState(INITIAL_POSITIONS)
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS)
  const [newPosition, setNewPosition] = useState('')
  const [newDepartment, setNewDepartment] = useState('')
  const [saving, setSaving] = useState(false)

  const addPosition = () => {
    const val = newPosition.trim()
    if (!val || positions.includes(val)) return
    setPositions([...positions, val])
    setNewPosition('')
  }

  const removePosition = (p) => setPositions(positions.filter(x => x !== p))

  const addDepartment = () => {
    const val = newDepartment.trim()
    if (!val || departments.includes(val)) return
    setDepartments([...departments, val])
    setNewDepartment('')
  }

  const removeDepartment = (d) => setDepartments(departments.filter(x => x !== d))

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert('저장됐습니다!')
    }, 800)
  }

  return (
    <div className={styles.container}>

      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>←</button>
          <div>
            <h1 className={styles.headerTitle}>회사 설정</h1>
            <p className={styles.headerSub}>회사 정보 및 직급 체계를 설정합니다</p>
          </div>
        </div>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '💾 저장'}
        </button>
      </header>

      <div className={styles.content}>

        {/* 회사 기본 정보 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🏢 회사 기본 정보</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label>회사명</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="회사명을 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* 직급 커스텀 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🏅 직급 체계</span>
            <span className={styles.countBadge}>{positions.length}개</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={newPosition}
                onChange={e => setNewPosition(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPosition()}
                placeholder="새 직급 입력"
              />
              <button className={styles.addBtn} onClick={addPosition}>+ 추가</button>
            </div>
            <div className={styles.tagList}>
              {positions.map((p, i) => (
                <div key={i} className={styles.tagItem}>
                  <span>{p}</span>
                  <button onClick={() => removePosition(p)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 부서 커스텀 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🏗️ 부서 관리</span>
            <span className={styles.countBadge}>{departments.length}개</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={newDepartment}
                onChange={e => setNewDepartment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addDepartment()}
                placeholder="새 부서 입력"
              />
              <button className={styles.addBtn} onClick={addDepartment}>+ 추가</button>
            </div>
            <div className={styles.tagList}>
              {departments.map((d, i) => (
                <div key={i} className={styles.tagItem}>
                  <span>{d}</span>
                  <button onClick={() => removeDepartment(d)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}