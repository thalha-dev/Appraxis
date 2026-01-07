import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HrDashboard from './pages/HrDashboard';
import PmDashboard from './pages/PmDashboard';
import ReviewForm from './pages/ReviewForm';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hr-dashboard" element={<HrDashboard />} />
              <Route path="/pm-dashboard" element={<PmDashboard />} />
              <Route path="/pm/reviews/:reviewId" element={<ReviewForm />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
