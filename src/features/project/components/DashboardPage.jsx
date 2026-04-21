import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import client from '../../../api/client'
import styles from './DashboardPage.module.css'

const toFrontStatus = (s) => {
  if (s === 'IN_PROGRESS') return 'in-progress'
  if (s === 'COMPLETED') return 'done'
  return 'todo'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfile, setShowProfile] = useState(false)
  const [projects, setProjects] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [profile, setProfile] = useState(null)
  const nickname = localStorage.getItem('nickname') || '사용자'

  const currentProjectUuid = (projectList) => {
    const stored = localStorage.getItem('currentProjectUuid')
    if (stored && projectList.some(p => p.uuid === stored)) return stored
    return projectList.length > 0 ? projectList[0].uuid : null
  }

  useEffect(() => {
    if (location.state?.openProfile) setShowProfile(true)
  }, [location.state])

  useEffect(() => {
    client.get('/api/user/profile')
      .then(res => setProfile(res.data))
      .catch(() => {})
  }, [])

  const loadProjects = async () => {
    try {
      const res = await client.get('/api/project')
      // 최신 생성순(위로)
      const loadedProjects = [...(res.data || [])].reverse()
      setProjects(loadedProjects)

      const taskArrays = await Promise.all(
        loadedProjects.map(p =>
          client.get(`/api/task/project/${p.uuid}`)
            .then(r => (r.data || []).map(t => ({
              ...t,
              status: toFrontStatus(t.status),
              projectName: p.name,
              projectId: p.uuid,
            })))
            .catch(() => [])
        )
      )
      setAllTasks(taskArrays.flat())
    } catch {}
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDeleteProject = async (e, uuid) => {
    e.stopPropagation()
    if (!window.confirm('프로젝트를 삭제할까요? 복구할 수 없습니다.')) return
    try {
      await client.delete(`/api/project/${uuid}`)
      setProjects(prev => prev.filter(p => p.uuid !== uuid))
      setAllTasks(prev => prev.filter(t => t.projectId !== uuid))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || String(err)
      alert(`삭제 실패: ${msg}`)
    }
  }

  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress')
  const doneTasks = allTasks.filter(t => t.status === 'done')

  return (
    <div className={styles.app}>

      <aside className={styles.sidebar}>
        <div className={styles.logo} onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoIcon}>🤖</div>
          <span className={styles.logoText}>AI PM</span>
          <span className={styles.logoBadge}>BETA</span>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>메인</div>
          <div className={styles.navItem} onClick={() => navigate('/dashboard')}>
            <span>⬛</span> 대시보드
          </div>
          <div className={styles.navItem} onClick={() => projects.length > 0 && navigate(`/projects/${currentProjectUuid(projects)}/tasks`)}>
            <span>✅</span> 태스크
          </div>
          <div className={styles.navItem} onClick={() => projects.length > 0 && navigate(`/projects/${currentProjectUuid(projects)}/risks`)}>
            <span>⚠️</span> 리스크
          </div>
          <div className={styles.navItem} onClick={() => projects.length > 0 && navigate(`/projects/${currentProjectUuid(projects)}/reports`)}>
            <span>📊</span> 보고서
          </div>
        </div>

        <div className={styles.sidebarDivider} />

        <div className={styles.navSection}>
          <div className={styles.navLabel}>설정</div>
          <div className={styles.navItem} onClick={() => navigate('/settings/company')}>
            <span>🏢</span> 회사 설정
          </div>
          <div className={styles.navItem} onClick={() => navigate('/settings/integration')}>
            <span>🔗</span> 연동 설정
          </div>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo} onClick={() => setShowProfile(true)}>
            <div className={styles.userAvatar}>{nickname.charAt(0)}</div>
            <div>
              <div className={styles.userName}>{nickname}</div>
              <div className={styles.userRole}>내 정보 보기</div>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <div className={styles.headerTitle}>대시보드</div>
            <div className={styles.headerSub}>
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.btnGhost}>🔔 알림</button>
          </div>
        </header>

        <div className={styles.content}>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>전체 프로젝트</div>
                <div className={styles.statValue}>{projects.length}</div>
                <div className={styles.statSub}>진행 중 {projects.length} · 완료 0</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconBlue}`}>📁</div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>내 태스크</div>
                <div className={styles.statValue}>{allTasks.length}</div>
                <div className={styles.statSub}>완료 {doneTasks.length}개</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconGreen}`}>✅</div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>리스크 감지</div>
                <div className={styles.statValue}>0</div>
                <div className={styles.statSub}>감지된 리스크 없음</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconRed}`}>⚠️</div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>AI 피드백</div>
                <div className={styles.statValue}>0</div>
                <div className={styles.statSub}>피드백 없음</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconYellow}`}>🤖</div>
            </div>
          </div>

          {projects.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>📁 내 프로젝트</span>
                <button
                  className={styles.btnPrimary}
                  style={{ fontSize: '12px', padding: '5px 12px' }}
                  onClick={() => navigate('/projects/new')}
                >
                  ＋ 새 프로젝트
                </button>
              </div>
              <div className={styles.cardBody}>
                {projects.map((p, i) => (
                  <div
                    key={p.uuid}
                    className={styles.taskItem}
                    onClick={() => navigate(`/projects/${p.uuid}/tasks`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ background: ['#3BBFD4','#22C98A','#F5BC3D','#F05A5A'][i % 4], width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 }} />
                    <div className={styles.taskInfo}>
                      <div className={styles.taskName}>{p.name}</div>
                      <div className={styles.taskMeta}>마감 {p.endDate || '-'}</div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '6px', background: '#E0F7FB', color: '#1E9CB5', fontWeight: 600 }}>
                      진행중
                    </span>
                    <button
                      onClick={(e) => handleDeleteProject(e, p.uuid)}
                      style={{
                        background: '#FEECEC', border: 'none', cursor: 'pointer',
                        color: '#F05A5A', fontSize: '11px', fontWeight: 600,
                        padding: '3px 9px', borderRadius: '6px',
                        fontFamily: 'inherit', flexShrink: 0, transition: 'opacity 0.12s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>📋 진행 중인 태스크</span>
              <button
                className={styles.btnGhost}
                style={{ fontSize: '12px', padding: '5px 12px' }}
                onClick={() => projects.length > 0 && navigate(`/projects/${currentProjectUuid(projects)}/tasks`)}
              >
                전체 보기
              </button>
            </div>
            <div className={styles.cardBody}>
              {inProgressTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <span>✅</span>
                  <p>진행 중인 태스크가 없습니다</p>
                  {projects.length > 0 ? (
                    <button className={styles.emptyBtn} onClick={() => navigate(`/projects/${currentProjectUuid(projects)}/tasks`)}>
                      태스크 보러가기
                    </button>
                  ) : (
                    <button className={styles.emptyBtn} onClick={() => navigate('/projects/new')}>
                      프로젝트 생성하기
                    </button>
                  )}
                </div>
              ) : (
                inProgressTasks.slice(0, 4).map((task, i) => (
                  <div key={i} className={styles.taskItem}
                    onClick={() => navigate(`/projects/${task.projectId}/tasks`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`${styles.taskCheck} ${styles.activeCheck}`} />
                    <div className={styles.taskInfo}>
                      <div className={styles.taskName}>{task.title}</div>
                      <div className={styles.taskMeta}>{task.projectName} · {task.dueDate}</div>
                    </div>
                    <div className={styles.taskRight}>
                      <span className={`${styles.tag} ${styles.tag_blue}`}>진행중</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

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
                <div className={styles.panelInfoItem}>
                  <span className={styles.panelInfoLabel}>닉네임</span>
                  <span className={styles.panelInfoValue}>{profile?.nickname || nickname}</span>
                </div>
                <div className={styles.panelInfoItem}>
                  <span className={styles.panelInfoLabel}>소속 회사</span>
                  <span className={styles.panelInfoValue}>{profile?.organizationId || '-'}</span>
                </div>
                <div className={styles.panelInfoItem}>
                  <span className={styles.panelInfoLabel}>직급</span>
                  <span className={styles.panelInfoValue}>{profile?.position || '-'}</span>
                </div>
                <div className={styles.panelInfoItem}>
                  <span className={styles.panelInfoLabel}>부서</span>
                  <span className={styles.panelInfoValue}>{profile?.departmentId || '-'}</span>
                </div>
              </div>
              <button className={styles.panelEditBtn} onClick={() => { setShowProfile(false); navigate('/profile') }}>
                ✏️ 프로필 수정하기
              </button>
              <button
                className={styles.panelEditBtn}
                style={{ marginTop: '8px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}
                onClick={() => { localStorage.clear(); navigate('/login') }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}