import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ProjectCreatePage.module.css'
import client from '../../../api/client'

export default function ProjectCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', deadline: '' })
  const [members, setMembers] = useState([])
  const [memberInput, setMemberInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addMember = () => {
    const val = memberInput.trim()
    if (!val || members.includes(val)) return
    setMembers([...members, val])
    setMemberInput('')
  }

  const removeMember = (name) => setMembers(members.filter(m => m !== name))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const projectRes = await client.post('/api/project', {
        name: form.name,
        description: form.description,
        endDate: form.deadline,
        members,
      })
      const projectUuid = projectRes.data.uuid
      localStorage.setItem('currentProjectUuid', projectUuid)
      navigate(`/projects/${projectUuid}/tasks`)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || String(err)
      alert(`실패:\n${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const isValid = form.name && form.description && form.deadline

  return (
    <div className={styles.container}>
      <div className={styles.wrap}>

        <div className={styles.pageHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>← 돌아가기</button>
          <div className={styles.pageTitle}>
            <div className={styles.pageTitleIcon}>📁</div>
            <div>
              <h1>새 프로젝트 생성</h1>
              <p>프로젝트 정보를 입력하고 시작하세요</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.formWrap}>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>기본 정보</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>프로젝트명 <span className={styles.required}>*</span></label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="프로젝트 이름을 입력하세요" required />
              </div>
              <div className={styles.formGroup}>
                <label>프로젝트 설명 <span className={styles.required}>*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="프로젝트 목표와 주요 내용을 입력하세요" rows={4} required />
              </div>
              <div className={styles.formGroup}>
                <label>마감일 <span className={styles.required}>*</span></label>
                <input
                  type="text" name="deadline" value={form.deadline}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9]/g, '')
                    if (val.length > 8) val = val.slice(0, 8)
                    if (val.length >= 5) val = val.slice(0, 4) + '-' + val.slice(4, 6) + (val.length > 6 ? '-' + val.slice(6) : '')
                    setForm({ ...form, deadline: val })
                  }}
                  placeholder="YYYY-MM-DD" maxLength={10} required
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>팀원 초대</span>
              <span className={styles.memberCount}>{members.length}명</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.memberInputRow}>
                <input
                  type="text" value={memberInput}
                  onChange={e => setMemberInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMember())}
                  placeholder="아이디 또는 이메일로 초대"
                />
                <button type="button" onClick={addMember} className={styles.addBtn}>+ 추가</button>
              </div>
              {members.length > 0 && (
                <div className={styles.memberList}>
                  {members.map((m, i) => {
                    const colors = ['#3BBFD4','#22C98A','#F5BC3D','#F05A5A','#9B7FD4']
                    return (
                      <div key={i} className={styles.memberTag}>
                        <div className={styles.memberAvatar} style={{ background: colors[i % colors.length] }}>
                          {m.charAt(0).toUpperCase()}
                        </div>
                        <span>{m}</span>
                        <button type="button" onClick={() => removeMember(m)}>✕</button>
                      </div>
                    )
                  })}
                </div>
              )}
              {members.length === 0 && (
                <div className={styles.emptyMembers}><p>초대할 팀원을 추가해보세요</p></div>
              )}
            </div>
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/dashboard')}>취소</button>
            <button type="submit" disabled={!isValid || loading} className={styles.submitBtn}>
              {loading ? '생성 중...' : '프로젝트 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}