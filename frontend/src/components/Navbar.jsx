/*
  Navbar component
  - Renders main navigation links and the current user's email
  - Uses `useAuth` to show/hide items based on authentication and role
*/
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { Home, Users, Calendar, User, LogOut } from 'lucide-react';

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
              <Home size={16} style={{ marginRight: 8 }} /> Dashboard
            </Link>
            <Link to="/patients" className={linkClassName('/patients')}>
              <Users size={16} style={{ marginRight: 8 }} /> Patients
            </Link>
            <Link to="/appointments" className={linkClassName('/appointments')}>
              <Calendar size={16} style={{ marginRight: 8 }} /> Appointments
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/users" className={linkClassName('/admin/users')}>
                Users
              </Link>
            )}
            <span className="user-chip"><User size={14} style={{ marginRight: 6 }} />{user?.email || 'Signed in'}</span>
            <button type="button" className="logout-button" onClick={logout}>
              <LogOut size={14} style={{ marginRight: 6 }} /> Logout
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