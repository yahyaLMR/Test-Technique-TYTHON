import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const linkClassName = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <header className="app-navbar">
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="brand">
        Medical Appointment System
      </Link>

      <nav className="nav-links" aria-label="Primary">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className={linkClassName('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/patients" className={linkClassName('/patients')}>
              Patients
            </Link>
            <Link to="/appointments" className={linkClassName('/appointments')}>
              Appointments
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/users" className={linkClassName('/admin/users')}>
                Users
              </Link>
            )}
            <span className="user-chip">{user?.email || 'Signed in'}</span>
            <button type="button" className="logout-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/" className={linkClassName('/')}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;