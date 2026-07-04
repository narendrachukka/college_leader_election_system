import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import StudentPage from './pages/StudentPage';
import api from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/profile')
      .then((res) => {
        setUser(res?.data?.user || null);
      })
      .catch((error) => {
        console.error('Unable to load profile:', error);
        localStorage.removeItem('token');
        setUser(null);
        setStatusMessage('The backend is not reachable yet. Please start the server and refresh.');
      })
      .finally(() => setLoading(false));
  }, []);

  const onAuth = (payload) => {
    setUser(payload.user);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={onLogout} />
      {statusMessage && <div className="card" style={{ margin: '16px auto 0', maxWidth: '720px' }}>{statusMessage}</div>}
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onAuth={onAuth} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={user?.username ? <AdminPage /> : <Navigate to="/login" replace />} />
          <Route path="/student" element={user ? <StudentPage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<div className="card">404 - Page not found</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
