import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../../components/layout/Sidebar'
import client from '../../../api/client'
import styles from './ReportPage.module.css'

const STORAGE_KEY = (id) => `reports_api_${id}`

export default function ReportPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [project, setProject] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [allProjects, setAllProjects] = useState([])
  const [selectedProjectUuid, setSelectedProjectUuid] = useState(id)
  const nickname = localStorage.getItem('nickname') || '사용자'

  useEffect(() => {
    if (!id) return
    const saved = localStorage.getItem(STORAGE_KEY(id))
    if (saved) {
      const parsed = JSON.parse(saved)
      setReports(parsed)
      if (parsed.length > 0) setSelected(parsed[0])
    }
    client.get(`/api/project/${id}`)
      .then(res => setProject(res.data))
      .catch(() => {})
  }, [id])

  useEffect(() => {
    client.get('/api/project')
      .then(res => setAllProjects([...(res.data || [])].reverse()))
      .catch(() => {})
  }, [])

  const saveReports = (updated, projectId) => {
    localStorage.setItem(STORAGE_KEY(projectId || id), JSON.stringify(updated))
    setReports(updated)
  }

  const handleGenerateClick = () => {
    setSelectedProjectUuid(id)
    setShowProjectModal(true)
  }

  const handleGenerate = async () => {
    setShowProjectModal(false)
    setGenerating(true)
    try {
      const targetProject = allProjects.find(p => p.uuid === selectedProjectUuid) || project
      const taskRes = await client.get(`/api/task/project/${selectedProjectUuid}`)
      const tasks = taskRes.data || []

      const doneTasks = tasks.filter(t => t.status === 'COMPLETED')
      const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS')
      const todoTasks = tasks.filter(t => t.status === 'PLANNED')
      const totalPct = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0

      const newReport = {
        id: Date.now(),
        title: `${targetProject?.name || '프로젝트'} 주간 보고서`,
        project: targetProject?.name || '프로젝트',
        projectUuid: selectedProjectUuid,
        date: new Date().toISOString().split('T')[0],
        type: 'weekly',
        summary: `${targetProject?.name || '프로젝트'}의 전체 태스크 중 ${totalPct}%가 완료되었습니다.`,
        sections: [
          { title: '📈 진행 상황', content: `전체 ${tasks.length}개 태스크 중 ${doneTasks.length}개 완료, ${inProgressTasks.length}개 진행 중, ${todoTasks.length}개 대기 중입니다. (완료율 ${totalPct}%)` },
          { title: '✅ 주요 성과', content: doneTasks.length > 0 ? `완료된 태스크: ${doneTasks.map(t => t.title).join(', ')}` : '아직 완료된 태스크가 없습니다.' },
          { title: '⚠️ 이슈 및 리스크', content: `현재 ${inProgressTasks.length}개 태스크가 진행 중입니다. 지속적인 모니터링이 필요합니다.` },
          { title: '📅 다음 주 계획', content: todoTasks.length > 0 ? `예정된 태스크: ${todoTasks.map(t => t.title).join(', ')}` : '모든 태스크가 진행 중이거나 완료되었습니다.' },
          { title: '👥 팀 현황', content: targetProject?.members?.length > 0 ? `총 ${targetProject.members.length}명의 팀원이 협업 중입니다.` : '팀원 정보가 없습니다.' },
        ]
      }

      const existing = localStorage.getItem(STORAGE_KEY(selectedProjectUuid))
      const prev = existing ? JSON.parse(existing) : []
      const updated = [newReport, ...prev]
      saveReports(updated, selectedProjectUuid)
      setSelected(newReport)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || String(err)
      alert(`보고서 생성 실패: ${msg}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteReport = (e, reportId) => {
    e.stopPropagation()
    if (!window.confirm('보고서를 삭제할까요?')) return
    const updated = reports.filter(r => r.id !== reportId)
    saveReports(updated)
    if (selected?.id === reportId) setSelected(updated.length > 0 ? updated[0] : null)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F8FA' }}>
      <Sidebar onProfileClick={() => setShowProfile(true)} />
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.headerTitle}>보고서</h1>
              <p className={styles.headerSub}>AI가 프로젝트 현황을 자동으로 분석합니다</p>
            </div>
          </div>
          <button className={styles.btnAi} onClick={handleGenerateClick} disabled={generating}>
            {generating ? <><span className={styles.spinner} /> 생성 중...</> : <><span className={styles.aiDot} /> 보고서 자동 생성</>}
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.twoCol}>
            <div className={styles.reportList}>
              <div className={styles.listTitle}>생성된 보고서</div>
              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#9BBEC5', fontSize: '13px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  <p>아직 보고서가 없습니다</p>
                  <p style={{ marginTop: '4px', fontSize: '12px' }}>보고서 자동 생성 버튼을 눌러보세요</p>
                </div>
              ) : (
                reports.map(r => (
                  <div
                    key={r.id}
                    className={`${styles.reportItem} ${selected?.id === r.id ? styles.reportItemActive : ''}`}
                    onClick={() => setSelected(r)}
                  >
                    <span className={styles.reportItemIcon}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={styles.reportItemTitle}>{r.title}</div>
                      <div className={styles.reportItemMeta}>{r.date} · {r.project}</div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteReport(e, r.id)}
                      style={{
                        background: '#FEECEC', border: 'none', cursor: 'pointer',
                        color: '#F05A5A', fontSize: '10px', fontWeight: 600,
                        padding: '2px 7px', borderRadius: '5px',
                        fontFamily: 'inherit', flexShrink: 0
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>

            {selected ? (
              <div className={styles.reportDetail}>
                <div className={styles.detailHeader}>
                  <div>
                    <h2 className={styles.detailTitle}>{selected.title}</h2>
                    <div className={styles.detailMeta}>{selected.date} · {selected.project}</div>
                  </div>
                  <button className={styles.downloadBtn} onClick={() => alert('다운로드 기능 준비 중입니다.')}>⬇ 다운로드</button>
                </div>
                <div className={styles.summaryBox}>
                  <div className={styles.summaryHeader}><span>🤖</span><span>AI 요약</span></div>
                  <p>{selected.summary}</p>
                </div>
                <div className={styles.sections}>
                  {selected.sections.map((s, i) => (
                    <div key={i} className={styles.section}>
                      <div className={styles.sectionTitle}>{s.title}</div>
                      <p className={styles.sectionContent}>{s.content}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.detailFooter}>🤖 이 보고서는 AI PM이 자동으로 생성했습니다</div>
              </div>
            ) : (
              <div className={styles.emptyDetail}>
                <span>📄</span>
                <p>보고서를 선택하거나 새로 생성하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 프로젝트 선택 모달 */}
      {showProjectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowProjectModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>보고서 생성할 프로젝트 선택</h2>
              <button onClick={() => setShowProjectModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {allProjects.length === 0 ? (
                <p style={{ color: '#9BBEC5', textAlign: 'center', padding: '20px' }}>프로젝트가 없습니다</p>
              ) : (
                allProjects.map(p => (
                  <div
                    key={p.uuid}
                    onClick={() => setSelectedProjectUuid(p.uuid)}
                    style={{
                      padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                      border: `1.5px solid ${selectedProjectUuid === p.uuid ? '#3BBFD4' : '#D6EFF4'}`,
                      background: selectedProjectUuid === p.uuid ? '#E0F7FB' : '#fff',
                      marginBottom: '8px', transition: 'all 0.13s'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F2A31' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#9BBEC5', marginTop: '2px' }}>마감 {p.endDate || '-'}</div>
                  </div>
                ))
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowProjectModal(false)}>취소</button>
              <button className={styles.saveBtn} onClick={handleGenerate} disabled={!selectedProjectUuid}>생성</button>
            </div>
          </div>
        </div>
      )}

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
              <button className={styles.panelEditBtn} onClick={() => { setShowProfile(false); navigate('/profile') }}>✏️ 프로필 수정하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}