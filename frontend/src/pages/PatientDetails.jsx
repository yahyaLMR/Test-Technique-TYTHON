import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { patientsAPI, appointmentsAPI } from '../services/api';
import '../styles/PatientDetails.css';
import { Edit2 } from 'lucide-react';

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const patientRes = await patientsAPI.get(id);
      setPatient(patientRes.data);

      // Fetch appointments for this patient
      const apptsRes = await appointmentsAPI.list({ patientId: id });
      setAppointments(apptsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!patient) return <div className="error-message">Patient not found</div>;

  const age = patient.dateOfBirth
    ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : 'N/A';

  return (
    <div className="patient-details-container">
      <Link to="/patients" className="back-link">← Back to Patients</Link>

      <div className="patient-header">
        <h1>{patient.name}</h1>
        <Link to={`/patients/${id}/edit`} className="edit-btn">Edit</Link>
      </div>

      <div className="patient-info-grid">
        <div className="info-section">
          <h2>Personal Information</h2>
          <div className="info-row">
            <span className="label">Name:</span>
            <span className="value">{patient.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Date of Birth:</span>
            <span className="value">{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
          </div>
          <div className="info-row">
            <span className="label">Age:</span>
            <span className="value">{age} years</span>
          </div>
          <div className="info-row">
            <span className="label">Phone:</span>
            <span className="value">{patient.phone || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">CIN:</span>
            <span className="value">{patient.cin || 'N/A'}</span>
          </div>
        </div>

        {patient.address ? (
          <div className="info-section">
            <h2>Address</h2>
            <div className="info-row">
              <span className="label">Address:</span>
              <span className="value">{patient.address}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="appointments-section">
        <div className="section-header">
          <h2>Appointments</h2>
          <Link to="/appointments" className="add-appointment-btn">+ New Appointment</Link>
        </div>

        {appointments.length > 0 ? (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Diagnosis</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id}>
                  <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                  <td>{appt.reason}</td>
                  <td>
                    <span className={`status-badge status-${appt.status}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>{appt.diagnosis || '-'}</td>
                  <td>{appt.followUpRequired ? 'Yes' : 'No'}</td>
                  <td>
                    <Link to={`/appointments/${appt._id}/edit`} style={{"color":"white"}} className="edit-btn-small"><Edit2 size={14} style={{ marginRight: 6}}/>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No appointments yet</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;
