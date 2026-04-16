import { useNavigate } from 'react-router-dom'
import styles from './Sidebar.module.css'

export default function Sidebar({ onProfileClick }) {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') || '사용자'

  const goTo = (path) => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    if (projects.length > 0) {
      navigate(path.replace(':id', projects[0].id))
    } else {
      navigate('/projects/new')
    }
  }

  return (
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
        <div className={styles.navItem} onClick={() => goTo('/projects/:id/tasks')}>
          <span>✅</span> 태스크
        </div>
        <div className={styles.navItem} onClick={() => goTo('/projects/:id/risks')}>
          <span>⚠️</span> 리스크
        </div>
        <div className={styles.navItem} onClick={() => goTo('/projects/:id/reports')}>
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
        <div className={styles.userInfo} onClick={onProfileClick}>
          <div className={styles.userAvatar}>{nickname.charAt(0)}</div>
          <div>
            <div className={styles.userName}>{nickname}</div>
            <div className={styles.userRole}>내 정보 보기</div>
          </div>
        </div>
      </div>
    </aside>
  )
}