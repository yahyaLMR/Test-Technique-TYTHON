import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentsAPI, patientsAPI } from '../services/api';
import '../styles/AppointmentForm.css';

const AppointmentForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '',
    reason: '',
    status: 'pending',
    notes: '',
    diagnosis: '',
    prescription: '',
    followUpRequired: false,
    followUpDate: '',
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
    if (isEdit && id) {
      fetchAppointment();
    }
  }, [isEdit, id]);

  const fetchPatients = async () => {
    try {
      const res = await patientsAPI.list();
      setPatients(res.data);
    } catch (err) {
      setError('Failed to fetch patients');
    }
  };

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const res = await appointmentsAPI.get(id);
      setFormData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && id) {
        await appointmentsAPI.update(id, formData);
      } else {
        await appointmentsAPI.create(formData);
      }
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-form-container">
      <button onClick={() => navigate('/appointments')} className="back-link">← Back</button>
      <h1>{isEdit ? 'Edit Appointment' : 'Create Appointment'}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-section">
          <h2>Appointment Details</h2>

          <div className="form-group">
            <label>Patient *</label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
              disabled={loading || isEdit}
            >
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate ? formData.appointmentDate.split('T')[0] : ''}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Reason *</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g., Checkup, Follow-up"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes"
              rows="3"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Medical Information</h2>

          <div className="form-group">
            <label>Diagnosis</label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Diagnosis (if applicable)"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Prescription</label>
            <textarea
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              placeholder="Prescribed medications"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="followUp"
              name="followUpRequired"
              checked={formData.followUpRequired}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="followUp">Follow-up Required</label>
          </div>

          {formData.followUpRequired && (
            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate ? formData.followUpDate.split('T')[0] : ''}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/appointments')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
