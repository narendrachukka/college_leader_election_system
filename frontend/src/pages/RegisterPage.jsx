import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', rollNumber: '', email: '', phone: '', department: '', year: '', password: '', confirmPassword: '', role: 'Voter', party: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await api.post('/register', {
        name: form.name,
        rollNumber: form.rollNumber,
        email: form.email,
        phone: form.phone,
        department: form.department,
        year: form.year,
        password: form.password,
        role: form.role,
        party: form.role === 'Contestant' ? form.party : null,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="form-shell">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Roll Number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        <div className="radio-group">
          <label><input type="radio" name="role" checked={form.role === 'Voter'} onChange={() => setForm({ ...form, role: 'Voter', party: '' })} /> I want to vote</label>
          <label><input type="radio" name="role" checked={form.role === 'Contestant'} onChange={() => setForm({ ...form, role: 'Contestant' })} /> I want to contest election</label>
        </div>
        {form.role === 'Contestant' && (
          <select value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })}>
            <option value="">Select party</option>
            <option value="Red">Red Party</option>
            <option value="Blue">Blue Party</option>
            <option value="Green">Green Party</option>
            <option value="Yellow">Yellow Party</option>
          </select>
        )}
        <button className="btn primary" type="submit">Create account</button>
      </form>
    </div>
  );
}

export default RegisterPage;
