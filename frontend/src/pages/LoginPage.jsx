import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginPage({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', rollNumber: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/login', {
        loginId: form.username || form.rollNumber,
        username: form.username,
        password: form.password,
        rollNumber: form.rollNumber,
      });
      localStorage.setItem('token', data.token);
      onAuth(data);
      navigate(data.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="form-shell">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input placeholder="Admin username or student roll number" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value, rollNumber: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn primary" type="submit">Sign in</button>
      </form>
    </div>
  );
}

export default LoginPage;
