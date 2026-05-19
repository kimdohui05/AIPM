import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import client from '../../../api/client'
import styles from './DashboardPage.module.css'

const toFrontStatus = (s) => {
  if (s === 'IN_PROGRESS') return 'in-progress'
  if (s === 'COMPLETED') return 'done'
  return 'todo'
}

function GanttChart({ tasks, projects }) {
  if (tasks.length === 0) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dates = tasks.filter(t => t.dueDate).map(t => new Date(t.dueDate))
  if (dates.length === 0) return (
    <div style={{ textAlign: 'center', padding: '30px', color: '#9BBEC5', fontSize: '13px' }}>
      마감일이 설정된 태스크가 없습니다
    </div>
  )
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))
  minDate.setDate(minDate.getDate() - 3)
  maxDate.setDate(maxDate.getDate() + 3)
  const totalDays = Math.max(Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)), 14)
  const getLeft = (date) => Math.max(0, Math.ceil((new Date(date) - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100)
  const todayLeft = Math.ceil((today - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100
  const formatDate = (d) => { const date = new Date(d); return `${date.getMonth() + 1}/${date.getDate()}` }
  const projectColors = ['#3BBFD4', '#22C98A', '#F5BC3D', '#F05A5A', '#9B7FD4']
  const projectColorMap = {}
  projects.forEach((p, i) => { projectColorMap[p.uuid] = projectColors[i % projectColors.length] })
  const statusColor = { 'todo': '#9BBEC5', 'in-progress': '#3BBFD4', 'done': '#22C98A' }
  const dateLabels = []
  for (let i = 0; i <= 4; i++) {
    const d = new Date(minDate)
    d.setDate(d.getDate() + Math.floor(totalDays * i / 4))
    dateLabels.push({ left: i * 25, label: formatDate(d) })
  }
  return (
    <div className={styles.ganttWrap}>
      <div className={styles.ganttHeader}>
        {dateLabels.map((d, i) => <div key={i} className={styles.ganttDateLabel} style={{ left: `${d.left}%` }}>{d.label}</div>)}
      </div>
      <div className={styles.ganttGrid}>
        {dateLabels.map((d, i) => <div key={i} className={styles.ganttGridLine} style={{ left: `${d.left}%` }} />)}
        {todayLeft >= 0 && todayLeft <= 100 && (
          <div className={styles.ganttTodayLine} style={{ left: `${todayLeft}%` }}>
            <div className={styles.ganttTodayLabel}>오늘</div>
          </div>
        )}
      </div>
      <div className={styles.ganttRows}>
        {tasks.filter(t => t.dueDate).map((task, i) => {
          const left = getLeft(task.dueDate)
          const color = statusColor[task.status] || '#3BBFD4'
          const isOverdue = task.status !== 'done' && new Date(task.dueDate) < today
          return (
            <div key={i} className={styles.ganttRow}>
              <div className={styles.ganttLabel} title={task.title}>
                <div className={styles.ganttLabelDot} style={{ background: projectColorMap[task.projectId] || '#3BBFD4' }} />
                <span>{task.title}</span>
              </div>
              <div className={styles.ganttBarWrap}>
                <div className={styles.ganttBar} style={{ left: `${Math.max(0, left - 3)}%`, width: '6%', background: isOverdue ? '#F05A5A' : color, opacity: task.status === 'done' ? 0.5 : 1 }} title={`${task.title} · 마감 ${task.dueDate}`} />
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.ganttLegend}>
        <div className={styles.ganttLegendItem}><div style={{ background: '#9BBEC5' }} className={styles.ganttLegendDot} />대기</div>
        <div className={styles.ganttLegendItem}><div style={{ background: '#3BBFD4' }} className={styles.ganttLegendDot} />진행중</div>
        <div className={styles.ganttLegendItem}><div style={{ background: '#22C98A' }} className={styles.ganttLegendDot} />완료</div>
        <div className={styles.ganttLegendItem}><div style={{ background: '#F05A5A' }} className={styles.ganttLegendDot} />지연</div>
      </div>
    </div>
  )
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>
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

  useEffect(() => { if (location.state?.openProfile) setShowProfile(true) }, [location.state])
  useEffect(() => { client.get('/api/user/profile').then(res => setProfile(res.data)).catch(() => {}) }, [])

  const loadProjects = async () => {
    try {
      const res = await client.get('/api/project')
      const loadedProjects = [...(res.data || [])].reverse()
      setProjects(loadedProjects)
      const taskArrays = await Promise.all(
        loadedProjects.map(p =>
          client.get(`/api/task/project/${p.uuid}`)
            .then(r => (r.data || []).map(t => ({ ...t, status: toFrontStatus(t.status), projectName: p.name, projectId: p.uuid })))
            .catch(() => [])
        )
      )
      setAllTasks(taskArrays.flat())
    } catch {}
  }

  useEffect(() => { loadProjects() }, [])

  const handleDeleteProject = async (e, uuid) => {
    e.stopPropagation()
    if (!window.confirm('프로젝트를 삭제할까요? 복구할 수 없습니다.')) return
    try {
      await client.delete(`/api/project/${uuid}`)
      setProjects(prev => prev.filter(p => p.uuid !== uuid))
      setAllTasks(prev => prev.filter(t => t.projectId !== uuid))
    } catch (err) {
      alert(`삭제 실패: ${err?.response?.data?.message || err?.message}`)
    }
  }

  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress')
  const doneTasks = allTasks.filter(t => t.status === 'done')
  const todoTasks = allTasks.filter(t => t.status === 'todo')

  const pieData = [
    { name: '대기', value: todoTasks.length, color: '#9BBEC5' },
    { name: '진행중', value: inProgressTasks.length, color: '#3BBFD4' },
    { name: '완료', value: doneTasks.length, color: '#22C98A' },
  ].filter(d => d.value > 0)

  const barData = projects.map(p => {
    const pTasks = allTasks.filter(t => t.projectId === p.uuid)
    const done = pTasks.filter(t => t.status === 'done').length
    const pct = pTasks.length > 0 ? Math.round(done / pTasks.length * 100) : 0
    return { name: p.name.length > 8 ? p.name.slice(0, 8) + '...' : p.name, 완료율: pct }
  })

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
          <div className={styles.navItem} onClick={() => navigate('/dashboard')}><span>⬛</span> 대시보드</div>
          <div className={styles.navItem} onClick={() => projects.length > 0 && navigate(`/projects/${currentProjectUuid(projects)}/tasks`)}><span>✅</span> 태스크</div>
          <div className={styles.navItem} onClick={() => projects.length > 0 && navigate(`/projects/${currentProjectUuid(projects)}/risks`)}><span>⚠️</span> 리스크</div>
          <div className={styles.navItem} onClick={() => projects.length > 0 && navigate(`/projects/${currentProjectUuid(projects)}/reports`)}><span>📊</span> 보고서</div>
        </div>
        <div className={styles.sidebarDivider} />
        <div className={styles.navSection}>
          <div className={styles.navLabel}>설정</div>
          <div className={styles.navItem} onClick={() => navigate('/settings/company')}><span>🏢</span> 회사 설정</div>
          <div className={styles.navItem} onClick={() => navigate('/settings/integration')}><span>🔗</span> 연동 설정</div>
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
            <div className={styles.headerSub}>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.btnGhost}>🔔 알림</button>
          </div>
        </header>

        <div className={styles.content}>

          {/* 통계 카드 */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div><div className={styles.statLabel}>전체 프로젝트</div><div className={styles.statValue}>{projects.length}</div><div className={styles.statSub}>진행 중 {projects.length} · 완료 0</div></div>
              <div className={`${styles.statIcon} ${styles.iconBlue}`}>📁</div>
            </div>
            <div className={styles.statCard}>
              <div><div className={styles.statLabel}>내 태스크</div><div className={styles.statValue}>{allTasks.length}</div><div className={styles.statSub}>완료 {doneTasks.length}개</div></div>
              <div className={`${styles.statIcon} ${styles.iconGreen}`}>✅</div>
            </div>
            <div className={styles.statCard}>
              <div><div className={styles.statLabel}>진행 중</div><div className={styles.statValue}>{inProgressTasks.length}</div><div className={styles.statSub}>대기 {todoTasks.length}개</div></div>
              <div className={`${styles.statIcon} ${styles.iconRed}`}>🔄</div>
            </div>
            <div className={styles.statCard}>
              <div><div className={styles.statLabel}>전체 완료율</div><div className={styles.statValue}>{allTasks.length > 0 ? Math.round(doneTasks.length / allTasks.length * 100) : 0}%</div><div className={styles.statSub}>완료 {doneTasks.length} / 전체 {allTasks.length}</div></div>
              <div className={`${styles.statIcon} ${styles.iconYellow}`}>📈</div>
            </div>
          </div>

          {/* 시각화 차트 */}
          {allTasks.length > 0 && (
            <div className={styles.chartRow}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>🍩 태스크 현황</span>
                </div>
                <div className={styles.cardBody} style={{ padding: '16px 18px' }}>
                  <div className={styles.donutWrap}>
                    <ResponsiveContainer width="55%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" labelLine={false} label={renderCustomLabel}>
                          {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value + '개', name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.donutLegend}>
                      {pieData.map((d, i) => (
                        <div key={i} className={styles.donutLegendItem}>
                          <div className={styles.donutLegendDot} style={{ background: d.color }} />
                          <span>{d.name}</span>
                          <strong>{d.value}개</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>📊 프로젝트별 완료율</span>
                </div>
                <div className={styles.cardBody} style={{ padding: '16px 18px' }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF7FA" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#527880' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#527880' }} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, '완료율']} />
                      <Bar dataKey="완료율" fill="#3BBFD4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 프로젝트 목록 */}
          {projects.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>📁 내 프로젝트</span>
                <button className={styles.btnPrimary} style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => navigate('/projects/new')}>＋ 새 프로젝트</button>
              </div>
              <div className={styles.cardBody}>
                {projects.map((p, i) => (
                  <div key={p.uuid} className={styles.taskItem} onClick={() => navigate(`/projects/${p.uuid}/tasks`)} style={{ cursor: 'pointer' }}>
                    <div style={{ background: ['#3BBFD4','#22C98A','#F5BC3D','#F05A5A'][i % 4], width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 }} />
                    <div className={styles.taskInfo}>
                      <div className={styles.taskName}>{p.name}</div>
                      <div className={styles.taskMeta}>마감 {p.endDate || '-'}</div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '6px', background: '#E0F7FB', color: '#1E9CB5', fontWeight: 600 }}>진행중</span>
                    <button
                      onClick={(e) => handleDeleteProject(e, p.uuid)}
                      style={{ background: '#FEECEC', border: 'none', cursor: 'pointer', color: '#F05A5A', fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '6px', fontFamily: 'inherit', flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >삭제</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 간트차트 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>📅 간트차트</span>
              <span style={{ fontSize: '11px', color: '#9BBEC5' }}>전체 태스크 일정</span>
            </div>
            <div className={styles.cardBody} style={{ padding: '16px 18px' }}>
              {allTasks.length > 0 ? (
                <GanttChart tasks={allTasks} projects={projects} />
              ) : (
                <div className={styles.emptyState}>
                  <span>📅</span>
                  <p>태스크가 없습니다</p>
                  {projects.length > 0 ? (
                    <button className={styles.emptyBtn} onClick={() => navigate(`/projects/${currentProjectUuid(projects)}/tasks`)}>태스크 보러가기</button>
                  ) : (
                    <button className={styles.emptyBtn} onClick={() => navigate('/projects/new')}>프로젝트 생성하기</button>
                  )}
                </div>
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
                <div className={styles.panelInfoItem}><span className={styles.panelInfoLabel}>닉네임</span><span className={styles.panelInfoValue}>{profile?.nickname || nickname}</span></div>
                <div className={styles.panelInfoItem}><span className={styles.panelInfoLabel}>소속 회사</span><span className={styles.panelInfoValue}>{profile?.organizationId || '-'}</span></div>
                <div className={styles.panelInfoItem}><span className={styles.panelInfoLabel}>직급</span><span className={styles.panelInfoValue}>{profile?.position || '-'}</span></div>
                <div className={styles.panelInfoItem}><span className={styles.panelInfoLabel}>부서</span><span className={styles.panelInfoValue}>{profile?.departmentId || '-'}</span></div>
              </div>
              <button className={styles.panelEditBtn} onClick={() => { setShowProfile(false); navigate('/profile') }}>✏️ 프로필 수정하기</button>
              <button className={styles.panelEditBtn} style={{ marginTop: '8px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }} onClick={() => { localStorage.clear(); navigate('/login') }}>로그아웃</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}