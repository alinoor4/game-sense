import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import HomePage from './pages/HomePage.jsx';
import GamePage from './pages/GamePage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import SensitivityPage from './pages/SensitivityPage.jsx';
import CrosshairPage from './pages/CrosshairPage.jsx';
import AimTrainerPage from './pages/AimTrainerPage.jsx';
import RoutinePage from './pages/RoutinePage.jsx';
import LineupsPage from './pages/LineupsPage.jsx';
import LineupMapPage from './pages/LineupMapPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminLessonsPage from './pages/admin/AdminLessonsPage.jsx';
import AdminLessonEditPage from './pages/admin/AdminLessonEditPage.jsx';
import AdminGamesPage from './pages/admin/AdminGamesPage.jsx';
import AdminGameEditPage from './pages/admin/AdminGameEditPage.jsx';
import AdminMapsPage from './pages/admin/AdminMapsPage.jsx';
import AdminMapEditPage from './pages/admin/AdminMapEditPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';

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
        <Route path="/tools/lineups" element={<LineupsPage />} />
        <Route path="/tools/lineups/:mapSlug" element={<LineupMapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLessonsPage />} />
          <Route path="/admin/lessons/new" element={<AdminLessonEditPage />} />
          <Route path="/admin/lessons/:id" element={<AdminLessonEditPage />} />
          <Route path="/admin/games" element={<AdminGamesPage />} />
          <Route path="/admin/games/new" element={<AdminGameEditPage />} />
          <Route path="/admin/games/:id" element={<AdminGameEditPage />} />
          <Route path="/admin/maps" element={<AdminMapsPage />} />
          <Route path="/admin/maps/new" element={<AdminMapEditPage />} />
          <Route path="/admin/maps/:id" element={<AdminMapEditPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
