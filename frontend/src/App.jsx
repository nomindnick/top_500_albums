import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Signup from './components/Signup';
import CurrentAlbum from './components/CurrentAlbum';
import Onboarding from './components/Onboarding';
import UserDashboard from './components/UserDashboard';
import CompletionCelebration from './components/CompletionCelebration';
import ProtectedRoute from './components/ProtectedRoute';
import AppLoader from './components/AppLoader';
import './App.css';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/countdown" 
              element={
                <ProtectedRoute>
                  <CurrentAlbum />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/celebration" 
              element={
                <ProtectedRoute>
                  <CompletionCelebration />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/countdown" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;