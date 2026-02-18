import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { SupportPage } from './pages/SupportPage';
import { FAQsPage } from './pages/FAQsPage';
import { HistoryPage } from './pages/HistoryPage';
import { CheckEligibilityPage } from './pages/CheckEligibilityPage';
import { StoriesPage } from './pages/StoriesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UsersPage } from './pages/UsersPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/check-eligibility" element={<CheckEligibilityPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
