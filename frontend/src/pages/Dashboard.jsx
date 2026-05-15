import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { patientsAPI, appointmentsAPI } from '../services/api';
import '../styles/Dashboard.css';
import { Users, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [totalPatients, setTotalPatients] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [patientsRes, apptsRes] = await Promise.all([patientsAPI.list(), appointmentsAPI.list()]);
        const patients = patientsRes.data || [];
        const appts = apptsRes.data || [];

        setTotalPatients(patients.length);

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const todays = appts.filter((a) => {
          if (!a.appointmentDate) return false;
          const d = new Date(a.appointmentDate).toISOString().split('T')[0];
          return d === todayStr;
        });

        setTodaysAppointments(todays.length);

        setPendingCount(appts.filter((a) => a.status === 'pending').length);
        setConfirmedCount(appts.filter((a) => a.status === 'confirmed').length);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h2>Welcome to Dashboard</h2>
        <p className="dashboard-subtitle">Hello, {user?.email || 'welcome back'}. Use the navbar to switch between sections.</p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{loading ? '...' : totalPatients}</div>
            <div className="stat-label">Total patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{loading ? '...' : todaysAppointments}</div>
            <div className="stat-label">Today's appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{loading ? '...' : pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{loading ? '...' : confirmedCount}</div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3><Users size={18} style={{ marginRight: 8 }} /> Manage Patients</h3>
            <p>View, search, and manage patient information</p>
            <Link to="/patients" className="card-link">Go to Patients →</Link>
          </div>
          <div className="dashboard-card">
            <h3><Calendar size={18} style={{ marginRight: 8 }} /> Schedule Appointments</h3>
            <p>Create and manage medical appointments</p>
            <Link to="/appointments" className="card-link">Go to Appointments →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
