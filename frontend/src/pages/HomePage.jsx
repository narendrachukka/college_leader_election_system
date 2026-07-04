import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Secure • Transparent • Fast</p>
          <h1>College Election Management System</h1>
          <p className="hero-copy">Run student elections, manage contestants, and publish results in one clean platform.</p>
          <div className="hero-actions">
            <Link className="btn primary" to="/login">Login</Link>
            <Link className="btn secondary" to="/register">Register</Link>
          </div>
        </div>
      </section>
      <section className="info-grid">
        <div className="info-card">
          <h3>Admin Controls</h3>
          <p>Start, stop, monitor, and publish election outcomes with ease.</p>
        </div>
        <div className="info-card">
          <h3>Student Voting</h3>
          <p>Students can register, compete, and cast a single secure vote.</p>
        </div>
        <div className="info-card">
          <h3>Live Results</h3>
          <p>Real-time vote counts and winner announcements after the election closes.</p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
