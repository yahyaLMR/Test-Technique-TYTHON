import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientsAPI } from '../services/api';
import '../styles/PatientForm.css';

const PatientForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    phone: '',
    cin: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch patient data if editing
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      patientsAPI
        .get(id)
        .then((res) => {
          // normalize address: backend provides a string
          const data = res.data || {};
          setFormData({
            name: data.name || '',
            dateOfBirth: data.dateOfBirth || '',
            phone: data.phone || '',
            cin: data.cin || '',
            address: data.address || '',
          });
          setError('');
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to fetch patient');
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && id) {
        await patientsAPI.update(id, formData);
      } else {
        await patientsAPI.create(formData);
      }
      navigate('/patients');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-form-container">
      <button onClick={() => navigate('/patients')} className="back-button">← Back</button>
      <h1>{isEdit ? 'Edit Patient' : 'Add Patient'}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>CIN</label>
            <input
              type="text"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Address</h2>
          <div className="form-group">
            <label>Full address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
              placeholder="Street, City, State, Zip, Country"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/patients')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
