import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className={styles.app}>

      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🤖</div>
          <span className={styles.logoText}>AI PM</span>
          <span className={styles.logoBadge}>BETA</span>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>메인</div>
          <div
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span>⬛</span> 대시보드
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'tasks' ? styles.active : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <span>✅</span> 태스크
            <span className={styles.navCount}>7</span>
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'risks' ? styles.active : ''}`}
            onClick={() => setActiveTab('risks')}
          >
            <span>⚠️</span> 리스크
            <span className={`${styles.navCount} ${styles.red}`}>2</span>
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'reports' ? styles.active : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span>📊</span> 보고서
          </div>
        </div>

        <div className={styles.sidebarDivider} />

        <div className={styles.navSection}>
          <div className={styles.navLabel}>설정</div>
          <div className={styles.navItem}><span>🏢</span> 회사 설정</div>
          <div className={styles.navItem}><span>🔗</span> 연동 설정</div>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>이</div>
            <div>
              <div className={styles.userName}>이재승</div>
              <div className={styles.userRole}>개발자</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <main className={styles.main}>

        {/* 헤더 */}
        <header className={styles.header}>
          <div>
            <div className={styles.headerTitle}>대시보드</div>
            <div className={styles.headerSub}>2026년 3월 17일 화요일</div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.btnGhost}>🔔 알림</button>
            <button className={styles.btnPrimary}>＋ 새 프로젝트</button>
          </div>
        </header>

        {/* 콘텐츠 */}
        <div className={styles.content}>

          {/* AI 배너 */}
          <div className={styles.aiBanner}>
            <div>
              <div className={styles.bannerLabel}>✦ AI PM 분석 완료</div>
              <div className={styles.bannerTitle}>3개 프로젝트의 리스크를 감지했어요</div>
              <div className={styles.bannerDesc}>앱 리뉴얼 프로젝트에서 일정 지연 가능성이 발견됐어요.</div>
            </div>
            <div className={styles.bannerActions}>
              <button className={styles.btnAi}>
                <span className={styles.aiDot} />
                AI 분석 보기
              </button>
              <button className={styles.btnOutlineWhite}>보고서 생성</button>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>전체 프로젝트</div>
                <div className={styles.statValue}>3</div>
                <div className={styles.statSub}>진행 중 2 · 완료 1</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconBlue}`}>📁</div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>내 태스크</div>
                <div className={styles.statValue}>7</div>
                <div className={styles.statSub}>이번 주 3개 완료</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconGreen}`}>✅</div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>리스크 감지</div>
                <div className={`${styles.statValue} ${styles.red}`}>2</div>
                <div className={styles.statSub}>주의 필요</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconRed}`}>⚠️</div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>AI 피드백</div>
                <div className={styles.statValue}>12</div>
                <div className={styles.statSub}>미확인 5개</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconYellow}`}>🤖</div>
            </div>
          </div>

          {/* 태스크 + 피드백 */}
          <div className={styles.twoCol}>

            {/* 태스크 목록 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>📋 진행 중인 태스크</span>
                <button className={styles.btnGhost} style={{ fontSize: '12px', padding: '5px 12px' }}>전체 보기</button>
              </div>
              <div className={styles.cardBody}>
                {[
                  { name: '로그인 API 연동 및 토큰 처리', project: '앱 리뉴얼', due: '3월 12일', status: '진행중', statusClass: 'yellow', assignee: '이', color: '#3BBFD4' },
                  { name: '메인 대시보드 UI 컴포넌트 제작', project: 'AI PM', due: '3월 15일', status: '검토중', statusClass: 'blue', assignee: '김', color: '#22C98A' },
                  { name: '데이터베이스 스키마 설계', project: '앱 리뉴얼', due: '완료', status: '완료', statusClass: 'green', assignee: '박', color: '#9B7FD4' },
                  { name: 'AI 태스크 분배 로직 구현', project: 'AI PM', due: '3월 20일', status: '진행중', statusClass: 'blue', assignee: '이', color: '#3BBFD4' },
                ].map((task, i) => (
                  <div key={i} className={styles.taskItem}>
                    <div className={`${styles.taskCheck} ${task.status === '완료' ? styles.done : styles.activeCheck}`}>
                      {task.status === '완료' ? '✓' : ''}
                    </div>
                    <div className={styles.taskInfo}>
                      <div className={`${styles.taskName} ${task.status === '완료' ? styles.taskDone : ''}`}>{task.name}</div>
                      <div className={styles.taskMeta}>{task.project} · {task.due}</div>
                    </div>
                    <div className={styles.taskRight}>
                      <div className={styles.assignee} style={{ background: task.color }}>{task.assignee}</div>
                      <span className={`${styles.tag} ${styles['tag_' + task.statusClass]}`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 피드백 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>🤖 AI 피드백</span>
                <span className={`${styles.tag} ${styles.tag_red}`}>미확인 5</span>
              </div>
              <div className={styles.cardBody}>
                {[
                  { level: 'high', label: '⚠ 높은 리스크', text: '디자인 시안 확정이 2일 지연됐어요. 후속 태스크 3개에 영향을 줄 수 있습니다.', time: '방금 전' },
                  { level: 'mid', label: '◆ 주의', text: '이번 주 태스크가 3개 집중돼 있어요. 일부 재배분을 권장합니다.', time: '1시간 전' },
                  { level: 'low', label: '✓ 정상', text: '내부 어드민 프로젝트가 순조롭게 진행 중이에요.', time: '3시간 전' },
                ].map((fb, i) => (
                  <div key={i} className={styles.feedbackItem}>
                    <div className={styles.feedbackAvatar}>🤖</div>
                    <div>
                      <div className={`${styles.riskBadge} ${styles['risk_' + fb.level]}`}>{fb.label}</div>
                      <div className={styles.feedbackText}>{fb.text}</div>
                      <div className={styles.feedbackTime}>{fb.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}