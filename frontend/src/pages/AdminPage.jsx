import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminPage() {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);

  const loadData = async () => {
    const [statsRes, studentsRes, candidatesRes, electionRes, resultsRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/students'),
      api.get('/candidates'),
      api.get('/election/status'),
      api.get('/results'),
    ]);
    setStats(statsRes.data);
    setStudents(studentsRes.data);
    setCandidates(candidatesRes.data);
    setElection(electionRes.data);
    setResults(resultsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleElection = async () => {
    await api.post(election?.status === 'Active' ? '/election/stop' : '/election/start');
    loadData();
  };

  return (
    <div className="page-stack">
      <h2>Admin Dashboard</h2>
      {stats && (
        <div className="stats-grid">
          <div className="card stat-card"><h3>{stats.totalStudents}</h3><p>Total Students</p></div>
          <div className="card stat-card"><h3>{stats.totalVoters}</h3><p>Total Voters</p></div>
          <div className="card stat-card"><h3>{stats.totalContestants}</h3><p>Total Contestants</p></div>
          <div className="card stat-card"><h3>{stats.votesCast}</h3><p>Votes Cast</p></div>
          <div className="card stat-card"><h3>{stats.electionStatus}</h3><p>Election Status</p></div>
        </div>
      )}
      <div className="card">
        <div className="section-head">
          <h3>Election Control</h3>
          <button className="btn primary" onClick={toggleElection}>{election?.status === 'Active' ? 'Stop Election' : 'Start Election'}</button>
        </div>
      </div>
      <div className="card">
        <h3>Students</h3>
        <table>
          <thead><tr><th>Name</th><th>Roll</th><th>Department</th><th>Role</th><th>Party</th></tr></thead>
          <tbody>{students.map((student) => <tr key={student.id}><td>{student.name}</td><td>{student.roll_number}</td><td>{student.department}</td><td>{student.role}</td><td>{student.party || '-'}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="card">
        <h3>Candidates</h3>
        <div className="candidate-list">{candidates.map((candidate) => <div key={candidate.id} className="candidate-card"><h4>{candidate.name}</h4><p>{candidate.party}</p><p>{candidate.department}</p></div>)}</div>
      </div>
      <div className="card">
        <h3>Results</h3>
        <div className="candidate-list">{results.map((result) => <div key={result.id} className="candidate-card"><h4>{result.name}</h4><p>{result.party}</p><p>{result.department}</p><p>Votes: {result.vote_count}</p></div>)}</div>
      </div>
    </div>
  );
}

export default AdminPage;
