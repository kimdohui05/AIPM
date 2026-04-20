import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../../components/layout/Sidebar'
import client from '../../../api/client'
import { getRisks, saveRisks } from '../../../store/projectStore'
import styles from './RiskPage.module.css'

// 백엔드 타입 → 프론트 타입 매핑
const TYPE_MAP = {
  DEADLINE: 'schedule',
  OVERLOAD: 'resource',
  BOTTLENECK: 'technical',
  DEPENDENCY: 'communication',
}
const TYPE_ICON = { schedule: '🕐', resource: '👥', technical: '⚙️', communication: '💬' }
const TYPE_LABEL = { schedule: '일정', resource: '리소스', technical: '기술', communication: '커뮤니케이션' }
const SEVERITY_LABEL = { high: '높음', medium: '중간', low: '낮음' }

const getRec = (type) => {
  switch (type) {
    case 'DEADLINE': return '태스크 우선순위를 재조정하고 일정을 검토하세요.'
    case 'OVERLOAD': return '태스크를 다른 팀원에게 재배분하세요.'
    case 'BOTTLENECK': return '선행 태스크를 먼저 완료하여 병목을 해소하세요.'
    case 'DEPENDENCY': return '태스크 담당자를 빠르게 배정하세요.'
    default: return '담당 팀원과 상황을 공유하세요.'
  }
}

export default function RiskPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [risks, setRisks] = useState([])
  const [filter, setFilter] = useState('all')
  const [analyzing, setAnalyzing] = useState(false)
  const [project, setProject] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const nickname = localStorage.getItem('nickname') || '사용자'

  useEffect(() => {
    if (id) {
      setRisks(getRisks(id))
      client.get(`/api/project/${id}`)
        .then(res => setProject(res.data))
        .catch(() => {})
    }
  }, [id])

  const filtered = risks.filter(r => {
    if (filter === 'active') return !r.resolved
    if (filter === 'resolved') return r.resolved
    return true
  })

  const toggleResolve = (riskId) => {
    const updated = risks.map(r => r.id === riskId ? { ...r, resolved: !r.resolved } : r)
    saveRisks(id, updated)
    setRisks(updated)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      // 1. 태스크 로드
      const taskRes = await client.get(`/api/task/project/${id}`)
      const tasks = taskRes.data || []

      if (tasks.length === 0) {
        alert('분석할 태스크가 없습니다. 먼저 태스크를 생성하세요.')
        return
      }

      // 2. 유저 프로필 로드
      let profile = null
      try {
        const profileRes = await client.get('/api/user/profile')
        profile = profileRes.data
      } catch {}

      // 3. 멤버 목록 구성 (현재 유저 + 태스크 담당자들)
      const members = []
      const myName = profile?.nickname || localStorage.getItem('nickname') || '나'

      members.push({
        name: myName,
        position: profile?.position || '팀원',
        techStack: '',
        yearsOfExperience: null,
        portfolio: profile?.portfolio || '',
      })

      const assigneeNames = [...new Set(tasks.map(t => t.assigneeName).filter(Boolean))]
      assigneeNames.forEach(name => {
        if (!members.some(m => m.name === name)) {
          members.push({ name, position: '팀원', techStack: '', yearsOfExperience: null, portfolio: '' })
        }
      })

      // 4. AI PM 분석 요청 (태스크 status/priority는 이미 백엔드 포맷)
      const res = await client.post('/api/ai/pm-analysis', {
        projectName: project?.name || '프로젝트',
        startDate: project?.startDate || new Date().toISOString().slice(0, 10),
        endDate: project?.endDate || new Date().toISOString().slice(0, 10),
        members,
        tasks: tasks.map(t => ({
          taskUuid: t.uuid,
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority || 'MEDIUM',
          assignee: t.assigneeName || '',
          dueDate: t.dueDate || null,
        })),
      })

      // 5. riskWarnings → 리스크 카드 변환
      const newRisks = (res.data.riskWarnings || []).map((w, i) => ({
        id: Date.now() + i,
        type: TYPE_MAP[w.type] || 'technical',
        severity: (w.severity || 'MEDIUM').toLowerCase(),
        title: w.message,
        desc: w.relatedMember ? `관련 팀원: ${w.relatedMember}` : '',
        rec: getRec(w.type),
        project: project?.name || '현재 프로젝트',
        detectedAt: new Date().toLocaleString('ko-KR'),
        resolved: false,
      }))

      // 기존 해결된 리스크는 유지, 미해결은 새 분석 결과로 교체
      const updated = [...newRisks, ...risks.filter(r => r.resolved)]
      saveRisks(id, updated)
      setRisks(updated)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || String(err)
      alert(`분석 실패: ${msg}`)
    } finally {
      setAnalyzing(false)
    }
  }

  const highCount = risks.filter(r => r.severity === 'high' && !r.resolved).length
  const midCount = risks.filter(r => r.severity === 'medium' && !r.resolved).length
  const lowCount = risks.filter(r => r.severity === 'low' && !r.resolved).length
  const resolvedCount = risks.filter(r => r.resolved).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F8FA' }}>
      <Sidebar onProfileClick={() => setShowProfile(true)} />
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.headerTitle}>리스크 감지</h1>
              <p className={styles.headerSub}>
                {project ? `${project.name} · ` : ''}AI가 프로젝트의 잠재적 위험 요소를 분석합니다
              </p>
            </div>
          </div>
          <button className={styles.btnAi} onClick={handleAnalyze} disabled={analyzing}>
            {analyzing
              ? <><span className={styles.spinner} /> 분석 중...</>
              : <><span className={styles.aiDot} /> AI 재분석</>}
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#FEECEC' }}>⚠️</div>
              <div><div className={styles.statLabel}>높은 리스크</div><div className={styles.statValue} style={{ color: '#F05A5A' }}>{highCount}</div></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#FEF7E0' }}>⚡</div>
              <div><div className={styles.statLabel}>중간 리스크</div><div className={styles.statValue} style={{ color: '#F5BC3D' }}>{midCount}</div></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#E0FAF0' }}>📋</div>
              <div><div className={styles.statLabel}>낮은 리스크</div><div className={styles.statValue} style={{ color: '#22C98A' }}>{lowCount}</div></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#E0F7FB' }}>✅</div>
              <div><div className={styles.statLabel}>해결 완료</div><div className={styles.statValue} style={{ color: '#3BBFD4' }}>{resolvedCount}</div></div>
            </div>
          </div>

          <div className={styles.filterRow}>
            {[{ key: 'all', label: '전체' }, { key: 'active', label: '미해결' }, { key: 'resolved', label: '해결됨' }].map(f => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {risks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9BBEC5' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
              <p style={{ fontSize: '14px' }}>감지된 리스크가 없습니다</p>
            </div>
          ) : (
            <div className={styles.riskList}>
              {filtered.map(risk => (
                <div
                  key={risk.id}
                  className={`${styles.riskCard} ${styles['severity_' + risk.severity]} ${risk.resolved ? styles.resolved : ''}`}
                >
                  <div className={styles.riskCardHeader}>
                    <span className={styles.riskTypeIcon}>{TYPE_ICON[risk.type] || '⚠️'}</span>
                    <div className={styles.riskTitleWrap}>
                      <div className={styles.riskTitle}>{risk.title}</div>
                      <div className={styles.riskMeta}>
                        <span className={styles.riskProject}>📁 {risk.project}</span>
                        <span className={styles.riskTime}>🕐 {risk.detectedAt}</span>
                      </div>
                    </div>
                    <div className={styles.riskBadges}>
                      <span className={styles.typeBadge}>{TYPE_LABEL[risk.type] || risk.type}</span>
                      <span className={`${styles.severityBadge} ${styles['sev_' + risk.severity]}`}>
                        {SEVERITY_LABEL[risk.severity] || risk.severity}
                      </span>
                    </div>
                  </div>
                  {risk.desc && <p className={styles.riskDesc}>{risk.desc}</p>}
                  <div className={styles.riskRec}><span>💡</span><span>{risk.rec}</span></div>
                  <div className={styles.riskFooter}>
                    {risk.resolved
                      ? <span className={styles.resolvedBadge}>✓ 해결됨</span>
                      : <span className={styles.activeBadge}>● 처리 중</span>}
                    <button
                      className={risk.resolved ? styles.btnReopen : styles.btnResolve}
                      onClick={() => toggleResolve(risk.id)}
                    >
                      {risk.resolved ? '다시 열기' : '해결 완료'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showProfile && (
        <div className={styles.panelOverlay} onClick={() => setShowProfile(false)}>
          <div className={styles.panel} onClick={e => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>내 정보</h2>
              <button className={styles.panelClose} onClick={() => setShowProfile(false)}>✕</button>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.panelAvatar}>{nickname.charAt(0)}</div>
              <div className={styles.panelNickname}>{nickname}</div>
              <div className={styles.panelInfo}>
                <div className={styles.panelInfoItem}><span className={styles.panelInfoLabel}>닉네임</span><span className={styles.panelInfoValue}>{nickname}</span></div>
                <div className={styles.panelInfoItem}><span className={styles.panelInfoLabel}>소속 회사</span><span className={styles.panelInfoValue}>-</span></div>
                <div className={styles.panelInfoItem}><span className={styles.panelInfoLabel}>직급</span><span className={styles.panelInfoValue}>-</span></div>
                <div className={styles.panelInfoItem}><span className={styles.panelInfoLabel}>부서</span><span className={styles.panelInfoValue}>-</span></div>
              </div>
              <button className={styles.panelEditBtn} onClick={() => { setShowProfile(false); navigate('/profile') }}>
                ✏️ 프로필 수정하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
