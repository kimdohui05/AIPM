import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './IntegrationPage.module.css'

export default function IntegrationPage() {
  const navigate = useNavigate()

  const [integrations, setIntegrations] = useState([
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      desc: '레포지토리 연동으로 커밋, PR 현황을 태스크와 연결합니다.',
      connected: false,
      value: '',
      placeholder: 'GitHub 레포지토리 URL',
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      desc: '프로젝트 알림과 AI 피드백을 Slack 채널로 받습니다.',
      connected: false,
      value: '',
      placeholder: 'Slack Webhook URL',
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      desc: '프로젝트 문서와 회의록을 Notion과 동기화합니다.',
      connected: false,
      value: '',
      placeholder: 'Notion API Key',
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: '📋',
      desc: 'Jira 이슈를 태스크와 자동으로 연동합니다.',
      connected: false,
      value: '',
      placeholder: 'Jira Project URL',
    },
  ])

  const [editing, setEditing] = useState(null)
  const [inputVal, setInputVal] = useState('')

  const handleConnect = (id) => {
    setEditing(id)
    const item = integrations.find(i => i.id === id)
    setInputVal(item.value)
  }

  const handleSave = (id) => {
    if (!inputVal.trim()) return
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, connected: true, value: inputVal.trim() } : i
    ))
    setEditing(null)
    setInputVal('')
  }

  const handleDisconnect = (id) => {
    if (!window.confirm('연동을 해제할까요?')) return
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, connected: false, value: '' } : i
    ))
  }

  return (
    <div className={styles.container}>

      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>←</button>
          <div>
            <h1 className={styles.headerTitle}>연동 설정</h1>
            <p className={styles.headerSub}>외부 서비스를 연결해 더 효율적으로 관리하세요</p>
          </div>
        </div>
      </header>

      <div className={styles.content}>

        {/* 연동 상태 요약 */}
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon} style={{ background: '#E0FAF0' }}>✅</div>
            <div>
              <div className={styles.summaryLabel}>연동됨</div>
              <div className={styles.summaryValue}>{integrations.filter(i => i.connected).length}개</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon} style={{ background: '#F0F0F0' }}>🔗</div>
            <div>
              <div className={styles.summaryLabel}>미연동</div>
              <div className={styles.summaryValue}>{integrations.filter(i => !i.connected).length}개</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon} style={{ background: '#E0F7FB' }}>🔧</div>
            <div>
              <div className={styles.summaryLabel}>전체</div>
              <div className={styles.summaryValue}>{integrations.length}개</div>
            </div>
          </div>
        </div>

        {/* 연동 목록 */}
        <div className={styles.integrationList}>
          {integrations.map(item => (
            <div key={item.id} className={`${styles.integrationCard} ${item.connected ? styles.connected : ''}`}>
              <div className={styles.integrationHeader}>
                <div className={styles.integrationIcon}>{item.icon}</div>
                <div className={styles.integrationInfo}>
                  <div className={styles.integrationName}>{item.name}</div>
                  <div className={styles.integrationDesc}>{item.desc}</div>
                </div>
                <div className={styles.integrationStatus}>
                  {item.connected
                    ? <span className={styles.statusOn}>● 연동됨</span>
                    : <span className={styles.statusOff}>○ 미연동</span>
                  }
                </div>
              </div>

              {/* 연동 입력 폼 */}
              {editing === item.id && (
                <div className={styles.inputWrap}>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder={item.placeholder}
                    onKeyDown={e => e.key === 'Enter' && handleSave(item.id)}
                    autoFocus
                  />
                  <div className={styles.inputBtns}>
                    <button className={styles.cancelBtn} onClick={() => setEditing(null)}>취소</button>
                    <button className={styles.saveBtn} onClick={() => handleSave(item.id)}>저장</button>
                  </div>
                </div>
              )}

              {/* 연동된 경우 값 표시 */}
              {item.connected && editing !== item.id && (
                <div className={styles.connectedValue}>
                  <span>🔗 {item.value}</span>
                </div>
              )}

              {/* 버튼 */}
              <div className={styles.integrationFooter}>
                {item.connected ? (
                  <>
                    <button className={styles.editBtn} onClick={() => handleConnect(item.id)}>수정</button>
                    <button className={styles.disconnectBtn} onClick={() => handleDisconnect(item.id)}>연동 해제</button>
                  </>
                ) : (
                  <button className={styles.connectBtn} onClick={() => handleConnect(item.id)}>
                    + 연동하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}