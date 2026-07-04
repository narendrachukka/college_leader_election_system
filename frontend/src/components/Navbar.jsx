import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="brand">College Election System</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to={user.role === 'admin' ? '/admin' : '/student'}>Dashboard</Link>
            <button className="ghost-btn" onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
