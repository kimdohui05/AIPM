import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../../components/layout/Sidebar'
import { getReports, saveReports } from '../../../store/projectStore'
import styles from './ReportPage.module.css'

export default function ReportPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [projectId, setProjectId] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const nickname = localStorage.getItem('nickname') || '사용자'

  useEffect(() => {
    const pid = id || JSON.parse(localStorage.getItem('projects') || '[]')[0]?.id
    if (pid) {
      setProjectId(pid)
      const saved = getReports(pid)
      setReports(saved)
      if (saved.length > 0) setSelected(saved[0])
    }
  }, [id])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      const project = projects.find(p => String(p.id) === String(projectId)) || projects[0]
      const tasks = JSON.parse(localStorage.getItem(`tasks_${projectId}`) || '[]')
      const doneTasks = tasks.filter(t => t.status === 'done')
      const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
      const todoTasks = tasks.filter(t => t.status === 'todo')
      const totalPct = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0

      const newReport = {
        id: Date.now(),
        title: `${project?.name || '프로젝트'} 주간 보고서`,
        project: project?.name || '프로젝트',
        date: new Date().toISOString().split('T')[0],
        type: 'weekly',
        summary: `${project?.name || '프로젝트'}의 전체 태스크 중 ${totalPct}%가 완료되었습니다.`,
        sections: [
          { title: '📈 진행 상황', content: `전체 ${tasks.length}개 태스크 중 ${doneTasks.length}개 완료, ${inProgressTasks.length}개 진행 중, ${todoTasks.length}개 대기 중입니다. (완료율 ${totalPct}%)` },
          { title: '✅ 주요 성과', content: doneTasks.length > 0 ? `완료된 태스크: ${doneTasks.map(t => t.title).join(', ')}` : '아직 완료된 태스크가 없습니다.' },
          { title: '⚠️ 이슈 및 리스크', content: `현재 ${inProgressTasks.length}개 태스크가 진행 중입니다. 지속적인 모니터링이 필요합니다.` },
          { title: '📅 다음 주 계획', content: todoTasks.length > 0 ? `예정된 태스크: ${todoTasks.map(t => t.title).join(', ')}` : '모든 태스크가 진행 중이거나 완료되었습니다.' },
          { title: '👥 팀 현황', content: project?.members?.length > 0 ? `총 ${project.members.length}명의 팀원이 협업 중입니다. (${project.members.join(', ')})` : '팀원 정보가 없습니다.' },
        ]
      }
      const updated = [newReport, ...reports]
      saveReports(projectId, updated)
      setReports(updated)
      setSelected(newReport)
      setGenerating(false)
    }, 2000)
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
          <button className={styles.btnAi} onClick={handleGenerate} disabled={generating}>
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
                  <div key={r.id} className={`${styles.reportItem} ${selected?.id === r.id ? styles.reportItemActive : ''}`} onClick={() => setSelected(r)}>
                    <span className={styles.reportItemIcon}>📄</span>
                    <div>
                      <div className={styles.reportItemTitle}>{r.title}</div>
                      <div className={styles.reportItemMeta}>{r.date} · {r.project}</div>
                    </div>
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