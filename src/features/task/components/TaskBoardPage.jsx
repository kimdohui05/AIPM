import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Sidebar from '../../../components/layout/Sidebar'
import client from '../../../api/client'
import styles from './TaskBoardPage.module.css'

const COLORS = ['#3BBFD4', '#22C98A', '#F5BC3D', '#F05A5A', '#9B7FD4']
const PRIORITY_LABEL = { high: '높음', medium: '중간', low: '낮음' }
const PRIORITY_CLASS = { high: 'priorityHigh', medium: 'priorityMid', low: 'priorityLow' }

const toFrontStatus = (s) => {
  if (s === 'IN_PROGRESS') return 'in-progress'
  if (s === 'COMPLETED') return 'done'
  return 'todo'
}
const toBackStatus = (s) => {
  if (s === 'in-progress') return 'IN_PROGRESS'
  if (s === 'done') return 'COMPLETED'
  return 'PLANNED'
}
const toFrontPriority = (p) => {
  if (p === 'HIGH') return 'high'
  if (p === 'LOW') return 'low'
  return 'medium'
}
const toBackPriority = (p) => {
  if (p === 'high') return 'HIGH'
  if (p === 'low') return 'LOW'
  return 'MEDIUM'
}

const mapTask = (t) => ({
  uuid: t.uuid,
  title: t.title || '태스크',
  description: t.description || '',
  assignee: t.assigneeName || '',
  priority: toFrontPriority(t.priority),
  due: t.dueDate || '',
  status: toFrontStatus(t.status),
  progress: t.progress ?? 0,
})

export default function TaskBoardPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const [tasks, setTasks] = useState([])
  const [project, setProject] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(!!location.state?.aiGenerating)
  const pollRef = useRef(null)
  const nickname = localStorage.getItem('nickname') || '사용자'

  useEffect(() => {
    localStorage.setItem('currentProjectUuid', id)
    loadTasks()
    client.get(`/api/project/${id}`)
      .then(res => setProject(res.data))
      .catch(() => {})
  }, [id])

  useEffect(() => {
    if (!aiGenerating) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await client.get(`/api/task/project/${id}`)
        const loaded = (res.data || []).map(mapTask)
        if (loaded.length > 0) {
          setTasks(loaded)
          setAiGenerating(false)
          clearInterval(pollRef.current)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(pollRef.current)
  }, [aiGenerating, id])

  const loadTasks = async () => {
    try {
      const res = await client.get(`/api/task/project/${id}`)
      setTasks((res.data || []).map(mapTask))
    } catch (err) {
      console.error('태스크 로드 실패:', err)
    }
  }

  const columns = [
    { key: 'todo', label: '대기', color: '#9BBEC5' },
    { key: 'in-progress', label: '진행중', color: '#3BBFD4' },
    { key: 'done', label: '완료', color: '#22C98A' },
  ]

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  const changeStatus = async (taskUuid, status) => {
    const task = tasks.find(t => t.uuid === taskUuid)
    const progress = status === 'done' ? 100 : status === 'todo' ? 0 : task?.progress
    try {
      const res = await client.put(`/api/task/${taskUuid}`, { status: toBackStatus(status), progress })
      setTasks(tasks.map(t => t.uuid === taskUuid ? mapTask(res.data) : t))
    } catch (err) { console.error('상태 변경 실패:', err) }
  }

  const changeProgress = async (taskUuid, progress) => {
    try {
      const res = await client.put(`/api/task/${taskUuid}`, { progress: Number(progress) })
      setTasks(tasks.map(t => t.uuid === taskUuid ? mapTask(res.data) : t))
    } catch (err) { console.error('진행률 변경 실패:', err) }
  }

  const openEdit = (task) => { setEditTask({ ...task }); setShowModal(true) }

  const handleDelete = async (taskUuid) => {
    if (!window.confirm('태스크를 삭제할까요?')) return
    try {
      await client.delete(`/api/task/${taskUuid}`)
      setTasks(tasks.filter(t => t.uuid !== taskUuid))
    } catch (err) { console.error('삭제 실패:', err) }
  }

  const handleAddTask = () => {
    setEditTask({ uuid: null, title: '', description: '', assignee: '', status: 'todo', priority: 'medium', due: '', progress: 0 })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!editTask.title.trim()) return
    setLoading(true)
    try {
      if (!editTask.uuid) {
        const res = await client.post(`/api/task/project/${id}`, {
          title: editTask.title,
          description: editTask.description,
          assigneeName: editTask.assignee,
          priority: toBackPriority(editTask.priority),
          dueDate: editTask.due || null,
        })
        setTasks([...tasks, mapTask(res.data)])
      } else {
        const res = await client.put(`/api/task/${editTask.uuid}`, {
          title: editTask.title,
          description: editTask.description,
          assigneeName: editTask.assignee,
          priority: toBackPriority(editTask.priority),
          dueDate: editTask.due || null,
          status: toBackStatus(editTask.status),
          progress: editTask.progress,
        })
        setTasks(tasks.map(t => t.uuid === editTask.uuid ? mapTask(res.data) : t))
      }
      setShowModal(false)
      setEditTask(null)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || String(err)
      alert(`저장 실패: ${msg}`)
    } finally { setLoading(false) }
  }

  const handleDueChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    if (val.length >= 5) val = val.slice(0, 4) + '-' + val.slice(4, 6) + (val.length > 6 ? '-' + val.slice(6) : '')
    setEditTask({ ...editTask, due: val })
  }

  const memberColor = (name) => {
    const names = [...new Set(tasks.map(t => t.assignee))]
    return COLORS[names.indexOf(name) % COLORS.length]
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F8FA' }}>
      <Sidebar onProfileClick={() => setShowProfile(true)} />
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>←</button>
            <div>
              <h1 className={styles.headerTitle}>{project?.name || '태스크 보드'}</h1>
              <p className={styles.headerSub}>
                총 {tasks.length}개 태스크
                {project?.endDate && ` · 마감일 ${project.endDate}`}
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.statsRow}>
              <div className={styles.statChip}>
                <span style={{ color: '#9BBEC5' }}>대기</span>
                <strong>{getTasksByStatus('todo').length}</strong>
              </div>
              <div className={styles.statChip}>
                <span style={{ color: '#3BBFD4' }}>진행중</span>
                <strong>{getTasksByStatus('in-progress').length}</strong>
              </div>
              <div className={styles.statChip}>
                <span style={{ color: '#22C98A' }}>완료</span>
                <strong>{getTasksByStatus('done').length}</strong>
              </div>
            </div>
            <button className={styles.btnPrimary} onClick={handleAddTask}>
              ＋ 태스크 추가
            </button>
          </div>
        </header>

        {aiGenerating && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#3BBFD4', fontSize: '14px', fontWeight: 600 }}>
            ✨ AI가 태스크를 생성 중입니다...
          </div>
        )}

        <div className={styles.board}>
          {tasks.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#9BBEC5' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                {aiGenerating ? 'AI가 태스크를 생성 중입니다. 잠시만 기다려주세요.' : '아직 태스크가 없습니다'}
              </p>
              {!aiGenerating && <button className={styles.btnPrimary} onClick={handleAddTask}>＋ 태스크 추가</button>}
            </div>
          ) : (
            columns.map(col => (
              <div key={col.key} className={styles.column}>
                <div className={styles.columnHeader}>
                  <div className={styles.columnDot} style={{ background: col.color }} />
                  <span className={styles.columnLabel}>{col.label}</span>
                  <span className={styles.columnCount}>{getTasksByStatus(col.key).length}</span>
                </div>
                <div className={styles.columnBody}>
                  {getTasksByStatus(col.key).map(task => (
                    <div key={task.uuid} className={styles.taskCard}>
                      <div className={styles.taskCardTop}>
                        <span className={`${styles.priorityBadge} ${styles[PRIORITY_CLASS[task.priority]]}`}>
                          {PRIORITY_LABEL[task.priority]}
                        </span>
                        <div className={styles.taskActions}>
                          <button onClick={() => openEdit(task)}>✏️</button>
                          <button onClick={() => handleDelete(task.uuid)}>🗑️</button>
                        </div>
                      </div>
                      <div className={styles.taskTitle}>{task.title}</div>
                      {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                      <div className={styles.taskDue}>📅 {task.due}</div>
                      {task.status === 'in-progress' && (
                        <div className={styles.progressWrap}>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${task.progress}%` }} />
                          </div>
                          <input
                            className={styles.progressInput}
                            type="number" min={0} max={100}
                            value={task.progress}
                            onChange={e => changeProgress(task.uuid, e.target.value)}
                          />
                          <span className={styles.progressPct}>%</span>
                        </div>
                      )}
                      <div className={styles.taskCardBottom}>
                        <div className={styles.assignee} style={{ background: memberColor(task.assignee) }}>
                          {task.assignee ? task.assignee.charAt(0) : '?'}
                        </div>
                        <span className={styles.assigneeName}>{task.assignee}</span>
                        <select
                          className={styles.statusSelect}
                          value={task.status}
                          onChange={e => changeStatus(task.uuid, e.target.value)}
                        >
                          <option value="todo">대기</option>
                          <option value="in-progress">진행중</option>
                          <option value="done">완료</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {getTasksByStatus(col.key).length === 0 && (
                    <div className={styles.emptyCol}><p>태스크 없음</p></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && editTask && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editTask.uuid ? '태스크 수정' : '태스크 추가'}</h2>
                <button onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>태스크명</label>
                  <input type="text" value={editTask.title} onChange={e => setEditTask({ ...editTask, title: e.target.value })} placeholder="태스크 이름을 입력하세요" />
                </div>
                <div className={styles.formGroup}>
                  <label>내용</label>
                  <textarea rows={3} value={editTask.description || ''} onChange={e => setEditTask({ ...editTask, description: e.target.value })} placeholder="태스크 내용을 입력하세요" />
                </div>
                <div className={styles.formGroup}>
                  <label>담당자</label>
                  <input type="text" value={editTask.assignee} onChange={e => setEditTask({ ...editTask, assignee: e.target.value })} placeholder="담당자 이름" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>우선순위</label>
                    <select value={editTask.priority} onChange={e => setEditTask({ ...editTask, priority: e.target.value })}>
                      <option value="high">높음</option>
                      <option value="medium">중간</option>
                      <option value="low">낮음</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>상태</label>
                    <select value={editTask.status} onChange={e => setEditTask({ ...editTask, status: e.target.value })}>
                      <option value="todo">대기</option>
                      <option value="in-progress">진행중</option>
                      <option value="done">완료</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>마감일</label>
                  <input
                    type="text"
                    value={editTask.due}
                    onChange={handleDueChange}
                    placeholder="YYYY-MM-DD"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>취소</button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        )}

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