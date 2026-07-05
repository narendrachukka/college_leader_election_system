import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar navbar-top">
      <div className="navbar-brand-group">
        <div className="logo-badge">School Logo</div>
        <div>
          <div className="brand-title">Student Council Elections 2024</div>
          <div className="brand-tagline">VOTE for Your Future: Shape the School Community.</div>
        </div>
      </div>
      <div className="nav-links">
        <Link className="nav-button" to="/">Home</Link>
        {!user ? (
          <>
            <Link className="nav-button" to="/login">Login</Link>
            <Link className="nav-button secondary" to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link className="nav-button" to={user.role === 'admin' ? '/admin' : '/student'}>Dashboard</Link>
            <button className="nav-button ghost-btn" onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
