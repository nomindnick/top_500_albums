import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Signup from './components/Signup';
import CurrentAlbum from './components/CurrentAlbum';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/countdown" 
                element={
                  <ProtectedRoute>
                    <CurrentAlbum />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/countdown" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;