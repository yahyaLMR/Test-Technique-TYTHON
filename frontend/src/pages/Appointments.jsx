import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import '../styles/Appointments.css';
import { Plus, X, RefreshCw, Edit2, Trash2 } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus, filterDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.list({
        ...(filterStatus && { status: filterStatus }),
        ...(filterDate && { date: filterDate }),
      });
      setAppointments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await appointmentsAPI.delete(id);
      setAppointments(appointments.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const getPatientId = (patient) => {
    if (!patient) return '';
    if (typeof patient === 'string') return patient;
    return patient._id || '';
  };

  const getPatientName = (patient) => {
    if (!patient) return 'Unknown patient';
    if (typeof patient === 'string') return 'Loading...';
    return patient.name || 'Unknown patient';
  };

  return (
    <div className="appointments-container">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>Track upcoming visits, statuses, and follow-ups.</p>
        </div>
        <Link to="/appointments/add" className="add-btn"><Plus size={14} style={{ marginRight: 6 }} /> Add Appointment</Link>
      </div>

      <div className="appointments-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <button onClick={() => { setFilterStatus(''); setFilterDate(''); }} className="clear-filters" style={{ display: 'flex', alignItems: 'center' }}>
          <X size={14} style={{ marginRight: 8 }} /> Clear Filters
        </button>

        <button onClick={fetchAppointments} disabled={loading} className="refresh-btn" style={{ display: 'flex', alignItems: 'center' }}>
          {loading ? (<><RefreshCw size={14} className="spin" style={{ marginRight: 8 }} />Loading...</>) : (<><RefreshCw size={14} style={{ marginRight: 8 }} />Refresh</>)}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="appointments-table-wrapper">
        {appointments.length > 0 ? (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Diagnosis</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, index) => (
                <tr key={appt._id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link to={`/patients/${getPatientId(appt.patientId)}`}>
                      {getPatientName(appt.patientId)}
                    </Link>
                  </td>
                  <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                  <td>{appt.reason}</td>
                  <td>
                    <span className={`status-badge status-${appt.status}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>{appt.diagnosis || '-'}</td>
                  <td>{appt.followUpRequired ? 'Yes' : 'No'}</td>
                  <td className="actions">
                    <Link to={`/appointments/${appt._id}/edit`} style={{ color: 'white' }} className="edit-btn"><Edit2 size={14} style={{ marginRight: 6 }} />Edit</Link>
                    <button onClick={() => deleteAppointment(appt._id)} className="delete-btn"><Trash2 size={14} style={{ marginRight: 6 }} />Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default Appointments;
