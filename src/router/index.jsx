import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '../features/auth/components/LandingPage'
import LoginPage from '../features/auth/components/LoginPage'
import SignupPage from '../features/auth/components/SignUpPage'
import DashboardPage from '../features/project/components/DashboardPage'
import TaskBoardPage from '../features/task/components/TaskBoardPage'
import LogPage from '../features/log/components/LogPage'
import ProjectCreatePage from '../features/project/components/ProjectCreatePage'
import RiskPage from '../features/ai-feedback/components/RiskPage'
import ProfilePage from '../features/profile/components/ProfilePage'
import ReportPage from '../features/ai-feedback/components/ReportPage'
import CompanySettingPage from '../features/company/components/CompanySettingPage'
import IntegrationPage from '../features/integration/components/IntegrationPage'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/new" element={<ProjectCreatePage />} />
        <Route path="/projects/:id/tasks" element={<TaskBoardPage />} />
        <Route path="/projects/:id/logs" element={<LogPage />} />
        <Route path="/projects/:id/risks" element={<RiskPage />} />
        <Route path="/projects/:id/reports" element={<ReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings/company" element={<CompanySettingPage />} />
        <Route path="/settings/integration" element={<IntegrationPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}