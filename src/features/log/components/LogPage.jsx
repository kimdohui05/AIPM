import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../../components/layout/Sidebar'
import styles from './LogPage.module.css'

const INITIAL_LOGS = [
  { id: 1, author: '이재승', task: '사용자 인증 시스템 구현', content: 'JWT 토큰 방식으로 로그인 구현 완료. 액세스 토큰 만료 시 리프레시 토큰으로 자동 갱신되도록 처리했습니다.', files: [], createdAt: '2026-03-17 14:32', aiFeedback: 'JWT 리프레시 토큰 구현이 잘 됐네요. 토큰 블랙리스트 처리도 고려해보세요.' },
  { id: 2, author: '김철수', task: '데이터베이스 스키마 설계', content: '사용자, 프로젝트, 태스크 테이블 ERD 설계 완료. 정규화 3NF 기준으로 작성했습니다.', files: ['ERD_v1.png'], createdAt: '2026-03-17 11:15', aiFeedback: null },
  { id: 3, author: '박영희', task: 'UI/UX 디자인 시스템 구축', content: '컬러 팔레트 및 컴포넌트 가이드라인 초안 완성. 피그마 링크 공유 예정입니다.', files: ['design-system-v1.fig'], createdAt: '2026-03-16 16:48', aiFeedback: '디자인 시스템 일관성이 좋습니다. 다크모드 대응도 미리 고려하면 좋을 것 같아요.' },
]

const MEMBER_COLORS = ['#3BBFD4', '#22C98A', '#F5BC3D', '#F05A5A', '#9B7FD4']

export default function LogPage() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [showEditor, setShowEditor] = useState(false)
  const [form, setForm] = useState({ task: '', content: '' })
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const memberColor = (name) => {
    const names = [...new Set(INITIAL_LOGS.map(l => l.author))]
    return MEMBER_COLORS[names.indexOf(name) % MEMBER_COLORS.length]
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).map(f => f.name)
    setFiles([...files, ...selected])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.task || !form.content) return
    setSubmitting(true)
    setTimeout(() => {
      const newLog = {
        id: Date.now(), author: '이재승', task: form.task, content: form.content,
        files, createdAt: new Date().toLocaleString('ko-KR').slice(0, -3), aiFeedback: null,
      }
      setLogs([newLog, ...logs])
      setForm({ task: '', content: '' })
      setFiles([])
      setShowEditor(false)
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onProfileClick={() => {}} />
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.headerTitle}>작업 로그</h1>
              <p className={styles.headerSub}>AI PM 개발 · {logs.length}개 로그</p>
            </div>
          </div>
          <button className={styles.btnPrimary} onClick={() => setShowEditor(!showEditor)}>
            {showEditor ? '✕ 닫기' : '＋ 로그 작성'}
          </button>
        </header>

        <div className={styles.content}>
          {showEditor && (
            <div className={styles.editor}>
              <div className={styles.editorHeader}>
                <div className={styles.editorAvatar} style={{ background: '#3BBFD4' }}>이</div>
                <span className={styles.editorName}>이재승</span>
              </div>
              <form onSubmit={handleSubmit} className={styles.editorForm}>
                <div className={styles.formGroup}>
                  <label>관련 태스크</label>
                  <select value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} required>
                    <option value="">태스크를 선택하세요</option>
                    <option>사용자 인증 시스템 구현</option>
                    <option>데이터베이스 스키마 설계</option>
                    <option>UI/UX 디자인 시스템 구축</option>
                    <option>핵심 기능 API 개발</option>
                    <option>프론트엔드 컴포넌트 개발</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>작업 내용</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    placeholder="오늘 작업한 내용을 자유롭게 작성하세요&#10;AI가 로그를 읽고 피드백을 제공합니다"
                    rows={5} required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>파일 첨부</label>
                  <div className={styles.fileUpload}>
                    <label htmlFor="logFile" className={styles.fileBtn}>📎 파일 선택</label>
                    <input id="logFile" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                    {files.length > 0 && (
                      <div className={styles.fileList}>
                        {files.map((f, i) => (
                          <span key={i} className={styles.fileTag}>
                            📄 {f}
                            <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.editorFooter}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowEditor(false)}>취소</button>
                  <button type="submit" disabled={submitting} className={styles.submitBtn}>
                    {submitting ? '저장 중...' : '🤖 로그 저장 및 AI 분석 요청'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.logList}>
            {logs.map((log) => (
              <div key={log.id} className={styles.logItem}>
                <div className={styles.timeline}>
                  <div className={styles.timelineDot} style={{ background: memberColor(log.author) }} />
                  <div className={styles.timelineLine} />
                </div>
                <div className={styles.logCard}>
                  <div className={styles.logCardHeader}>
                    <div className={styles.logAuthor}>
                      <div className={styles.authorAvatar} style={{ background: memberColor(log.author) }}>
                        {log.author.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.authorName}>{log.author}</div>
                        <div className={styles.logTime}>{log.createdAt}</div>
                      </div>
                    </div>
                    <span className={styles.taskBadge}>{log.task}</span>
                  </div>
                  <p className={styles.logContent}>{log.content}</p>
                  {log.files.length > 0 && (
                    <div className={styles.logFiles}>
                      {log.files.map((f, i) => <span key={i} className={styles.fileTag}>📄 {f}</span>)}
                    </div>
                  )}
                  {log.aiFeedback && (
                    <div className={styles.aiFeedback}>
                      <div className={styles.aiFeedbackHeader}><span>🤖</span><span>AI 피드백</span></div>
                      <p>{log.aiFeedback}</p>
                    </div>
                  )}
                  {!log.aiFeedback && (
                    <div className={styles.aiPending}>
                      <span className={styles.aiDot} />
                      AI 피드백 분석 중...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}