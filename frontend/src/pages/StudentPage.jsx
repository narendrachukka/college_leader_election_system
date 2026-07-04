import { useEffect, useState } from 'react';
import api from '../services/api';

function StudentPage({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [candidatesRes, electionRes] = await Promise.all([api.get('/candidates'), api.get('/election/status')]);
    setCandidates(candidatesRes.data);
    setElection(electionRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const vote = async (candidateId) => {
    try {
      await api.post('/vote', { candidateId });
      setMessage('Thank you for voting.');
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Vote failed.');
    }
  };

  return (
    <div className="page-stack">
      <div className="card welcome-card">
        <h2>Welcome, {user?.name || user?.username}</h2>
        <p>Roll Number: {user?.rollNumber || 'Admin'}</p>
        <p>Department: {user?.department || 'Administration'}</p>
        <p>Role: {user?.role || 'Admin'}</p>
        <p>Election Status: {election?.status || 'Inactive'}</p>
      </div>
      {message && <p className="success">{message}</p>}
      {election?.status === 'Active' ? (
        <div className="candidate-list">
          {candidates.map((candidate) => (
            <div className="card candidate-card" key={candidate.id}>
              <h3>{candidate.name}</h3>
              <p>{candidate.department}</p>
              <p>{candidate.party} Party</p>
              <button className="btn primary" onClick={() => vote(candidate.id)}>Vote</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">Election has not started yet. Please wait for admin.</div>
      )}
    </div>
  );
}

export default StudentPage;
