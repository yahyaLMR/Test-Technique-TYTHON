import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientsAPI } from '../services/api';
import '../styles/PatientsList.css';
import { Plus, RefreshCw, Edit2, Trash2, Eye, X, Search } from 'lucide-react';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const itemsPerPage = 10;

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, [search, currentPage]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientsAPI.list({ search: search.trim(), page: currentPage, limit: itemsPerPage });
      const payload = res.data;
      const records = Array.isArray(payload) ? payload : (payload.patients || []);
      const pagination = Array.isArray(payload) ? null : payload.pagination;

      setPatients(records);
      setTotalPatients(pagination?.total || records.length);
      setTotalPages(pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await patientsAPI.delete(id);
      setPatients(patients.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCurrentPage(1);
  };

  return (
    <div className="patients-container">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>Search, review, and manage patient records.</p>
        </div>
        <Link to="/patients/add" className="add-btn"><Plus size={14} style={{ marginRight: 6 }} /> Add Patient</Link>
      </div>

      <div className="patients-controls">
        <input
          type="text"
          placeholder="Search by name, CIN, or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
          style={{ flex: 1 }}
        />
        <button onClick={clearFilters} style={{ padding: '12px 20px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
          <X size={14} style={{ marginRight: 8 }} /> Clear
        </button>
        <button onClick={fetchPatients} disabled={loading} style={{ display: 'flex', alignItems: 'center' }}>
          {loading ? (<><RefreshCw size={14} className="spin" style={{ marginRight: 8 }} />Loading...</>) : (<><RefreshCw size={14} style={{ marginRight: 8 }} />Refresh</>)}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="patients-table-wrapper">
        {patients.length > 0 ? (
          <table className="patients-table">
            <thead>
              <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>Phone</th>
                  <th>CIN</th>
                  <th>Address</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr key={patient._id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{patient.name}</td>
                  <td>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'}</td>
                  <td>{patient.phone || '-'}</td>
                  <td>{patient.cin || '-'}</td>
                  <td>{patient.address || '-'}</td>
                  <td>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="actions">
                    <Link to={`/patients/${patient._id}`} className="view-btn"><Eye size={14} style={{ marginRight: 6 }} />View</Link>
                    <Link to={`/patients/${patient._id}/edit`} className="edit-btn"><Edit2 size={14} style={{ marginRight: 6 }} />Edit</Link>
                    <button onClick={() => deletePatient(patient._id)} className="delete-btn"><Trash2 size={14} style={{ marginRight: 6 }} />Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No patients found</p>
        )}
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages || 1} {totalPatients ? `(${totalPatients} total)` : ''}</span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientsList;
