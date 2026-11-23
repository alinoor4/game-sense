import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import HomePage from './pages/HomePage.jsx';
import GamePage from './pages/GamePage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import SensitivityPage from './pages/SensitivityPage.jsx';
import CrosshairPage from './pages/CrosshairPage.jsx';
import AimTrainerPage from './pages/AimTrainerPage.jsx';
import RoutinePage from './pages/RoutinePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/:gameSlug" element={<GamePage />} />
        <Route path="/games/:gameSlug/:lessonSlug" element={<LessonPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/sensitivity" element={<SensitivityPage />} />
        <Route path="/tools/crosshair" element={<CrosshairPage />} />
        <Route path="/tools/aim-trainer" element={<AimTrainerPage />} />
        <Route path="/tools/routine" element={<RoutinePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
