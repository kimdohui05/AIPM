import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>

      {/* 네비게이션 */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span>AI PM</span>
        </div>
        <div className={styles.navBtns}>
          <button className={styles.btnGhost} onClick={() => navigate('/login')}>로그인</button>
          <button className={styles.btnPrimary} onClick={() => navigate('/signup')}>회원가입</button>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>✦ AI 기반 프로젝트 관리</div>
        <h1 className={styles.heroTitle}>
          복잡한 프로젝트 관리<br />
          <span className={styles.heroHighlight}>이제 AI PM에게</span> 맡기세요
        </h1>
        <p className={styles.heroDesc}>
          막힘없는 업무 흐름 조성부터 보고서 생성까지,<br />
          프로젝트의 전 과정을 서포트합니다.
        </p>
      </section>

      {/* 기능 카드 */}
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>AI PM이 해드리는 것들</h2>
        <div className={styles.featureGrid}>
          {[
            { icon: '✅', title: '스마트 업무 연결', desc: '프로젝트 정보를 입력하면 AI가 태스크를 자동으로 생성하고 팀원에게 배정합니다.' },
            { icon: '📊', title: '지능형 워크플로우', desc: '팀원이 남긴 로그를 AI가 읽고 실시간으로 피드백과 코멘트를 제공합니다.' },
            { icon: '⚠️', title: '리스크 감지', desc: '일정 지연 가능성과 병목 구간을 자동으로 감지하고 알려드립니다.' },
            { icon: '📋', title: '원클릭 인사이트 보기', desc: '주간 보고서와 프로젝트 현황을 버튼 하나로 자동 생성합니다.' },
            { icon: '🏢', title: '회사 간 협업', desc: '여러 회사가 참여하는 협업 프로젝트도 손쉽게 관리할 수 있습니다.' },
            { icon: '🔗', title: '외부 연동', desc: 'GitHub, Slack 등 외부 서비스와 연동하여 더 효율적으로 관리하세요.' },
          ].map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className={styles.cta}>
        <div className={styles.ctaBox}>
          <h2>지금 바로 시작해보세요</h2>
          <p>AI PM과 함께라면 복잡한 프로젝트 관리도 쉬워집니다</p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <span>AI PM</span>
        </div>
        <p>© 2026 AI PM. All rights reserved.</p>
      </footer>

    </div>
  )
}