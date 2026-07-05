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
    <div className="admin-page">
      <header className="admin-hero">
        <div>
          <p className="eyebrow">Admin Workspace</p>
          <h1>Election Command Center</h1>
          <p className="hero-copy">Manage campaigns, monitor turnout, and publish final results from a polished leaderboard experience designed for presentation-ready projects.</p>
        </div>
        <div className="admin-actions">
          <button className="btn secondary" onClick={toggleElection}>{election?.status === 'Active' ? 'Stop Election' : 'Start Election'}</button>
          <div className={`status-pill ${election?.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{election?.status || 'Loading...'}</div>
        </div>
      </header>

      {stats && (
        <section className="stats-grid admin-stats-grid">
          <div className="stat-card highlight"><span>Total Students</span><strong>{stats.totalStudents}</strong></div>
          <div className="stat-card"><span>Total Voters</span><strong>{stats.totalVoters}</strong></div>
          <div className="stat-card"><span>Contestants</span><strong>{stats.totalContestants}</strong></div>
          <div className="stat-card"><span>Votes Cast</span><strong>{stats.votesCast}</strong></div>
        </section>
      )}

      <section className="leaderboard-card card">
        <div className="section-head">
          <div>
            <h2>Live Leaderboard</h2>
            <p>Top candidates ranked by total votes and share of turnout.</p>
          </div>
          <span className="badge">Resume Ready</span>
        </div>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate</th>
              <th>Party</th>
              <th>Votes</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.id} className={index < 3 ? `top-${index + 1}` : ''}>
                <td>{index + 1}</td>
                <td>{result.name}</td>
                <td>{result.party || 'N/A'}</td>
                <td>{result.vote_count}</td>
                <td>{result.vote_count ? `${((result.vote_count / Math.max(stats.votesCast, 1)) * 100).toFixed(1)}%` : '0.0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="candidate-detail-grid">
        <div className="card">
          <h3>Key Campaign Metrics</h3>
          <ul>
            <li>Candidate roster with department and party details.</li>
            <li>Election status, turnout, and vote performance in one screen.</li>
            <li>Ready for portfolio demos with professional summary layout.</li>
          </ul>
        </div>
        <div className="card">
          <h3>Student Snapshot</h3>
          <p>Review voter registration trends and confirm eligible students before result publication.</p>
          <div className="student-counts">
            <div><strong>{stats?.totalStudents}</strong><span>Registered</span></div>
            <div><strong>{stats?.totalVoters}</strong><span>Voters</span></div>
          </div>
        </div>
      </section>

      <section className="card admin-resume-card">
        <h3>Project Highlights</h3>
        <div className="resume-list">
          <p><strong>Full-stack dashboard:</strong> secure admin login, student management, and election control.</p>
          <p><strong>Design ready for showcase:</strong> polished data presentation, leaderboard, and professional layout.</p>
          <p><strong>Resume-friendly:</strong> easy to describe as a real-world election management platform.</p>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
