import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../../components/layout/Sidebar'
import styles from './IntegrationPage.module.css'

export default function IntegrationPage() {
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const nickname = localStorage.getItem('nickname') || '사용자'

  const [integrations, setIntegrations] = useState([
    { id: 'github', name: 'GitHub', icon: '🐙', desc: '레포지토리 연동으로 커밋, PR 현황을 태스크와 연결합니다.', connected: false, value: '', placeholder: 'GitHub 레포지토리 URL' },
    { id: 'notion', name: 'Notion', icon: '📝', desc: '프로젝트 문서와 회의록을 Notion과 동기화합니다.', connected: false, value: '', placeholder: 'Notion API Key' },
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
    setIntegrations(integrations.map(i => i.id === id ? { ...i, connected: true, value: inputVal.trim() } : i))
    setEditing(null)
    setInputVal('')
  }

  const handleDisconnect = (id) => {
    if (!window.confirm('연동을 해제할까요?')) return
    setIntegrations(integrations.map(i => i.id === id ? { ...i, connected: false, value: '' } : i))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F8FA' }}>
      <Sidebar onProfileClick={() => setShowProfile(true)} />
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.headerTitle}>연동 설정</h1>
              <p className={styles.headerSub}>외부 서비스를 연결해 더 효율적으로 관리하세요</p>
            </div>
          </div>
        </header>

        <div className={styles.content}>
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
                    {item.connected ? <span className={styles.statusOn}>● 연동됨</span> : <span className={styles.statusOff}>○ 미연동</span>}
                  </div>
                </div>

                {editing === item.id && (
                  <div className={styles.inputWrap}>
                    <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder={item.placeholder} onKeyDown={e => e.key === 'Enter' && handleSave(item.id)} autoFocus />
                    <div className={styles.inputBtns}>
                      <button className={styles.cancelBtn} onClick={() => setEditing(null)}>취소</button>
                      <button className={styles.saveBtn} onClick={() => handleSave(item.id)}>저장</button>
                    </div>
                  </div>
                )}

                {item.connected && editing !== item.id && (
                  <div className={styles.connectedValue}><span>🔗 {item.value}</span></div>
                )}

                <div className={styles.integrationFooter}>
                  {item.connected ? (
                    <>
                      <button className={styles.editBtn} onClick={() => handleConnect(item.id)}>수정</button>
                      <button className={styles.disconnectBtn} onClick={() => handleDisconnect(item.id)}>연동 해제</button>
                    </>
                  ) : (
                    <button className={styles.connectBtn} onClick={() => handleConnect(item.id)}>+ 연동하기</button>
                  )}
                </div>
              </div>
            ))}
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