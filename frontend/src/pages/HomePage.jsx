import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero-card hero-modern">
        <div className="hero-copy-block">
          <p className="eyebrow">Student Council Election System</p>
          <h1>Run polished school elections with confidence.</h1>
          <p className="hero-copy">A professional, resume-ready election portal built for administrators, candidates, and voters. Clean UI, audit-ready controls, and live leaderboard insights make elections simple.</p>
          <div className="hero-actions">
            <Link className="btn primary" to="/login">Login</Link>
            <Link className="btn secondary" to="/register">Register</Link>
          </div>
        </div>
        <div className="hero-highlight">
          <div className="stat-pill">2024 Election Ready</div>
          <div className="feature-list">
            <div>
              <h4>Secure</h4>
              <p>Encrypted auth and role-based admin flows.</p>
            </div>
            <div>
              <h4>Transparent</h4>
              <p>Real-time vote tracking and fair result publishing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-panel">
        <p>“Empower every student voice. Build trust with a transparent election system that looks and feels professional.”</p>
        <span>— Student Council IT Team</span>
      </section>

      <section className="theme-grid">
        <div className="theme-card highlight">
          <h3>Modern Dashboard</h3>
          <p>Clean visuals for administrators and voters, inspired by professional SaaS products.</p>
        </div>
        <div className="theme-card">
          <h3>Resume Ready</h3>
          <p>Design and sections that showcase your project like a polished portfolio application.</p>
        </div>
        <div className="theme-card">
          <h3>Election Themes</h3>
          <p>Customizable layout sections for announcements, candidate profiles, and live results.</p>
        </div>
      </section>

      <section className="info-grid home-info-grid">
        <div className="info-card">
          <h3>Campaign Management</h3>
          <p>Create a structured candidate experience with party, department, and profile details.</p>
        </div>
        <div className="info-card">
          <h3>Smart Notifications</h3>
          <p>Inform voters about election status, registration deadlines, and result announcements.</p>
        </div>
        <div className="info-card">
          <h3>Admin Resume Showcase</h3>
          <p>Use this project as a portfolio piece with organized functionality and professional layout.</p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
