import React, { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import '../styles/PatientForm.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await usersAPI.list();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(null);
    try {
      await usersAPI.create({ email, password, role });
      setEmail('');
      setPassword('');
      setRole('staff');
      await loadUsers();
      setSuccess('User created successfully');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      setDeletingId(id);
      await usersAPI.delete(id);
      await loadUsers();
      setSuccess('User deleted');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="patient-form-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Admin — User Management</h1>
      </div>

      <div className="patient-form" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Create User</h2>
        <form onSubmit={handleCreate} className="form-grid">
          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
            <button type="submit" disabled={loading || !email || !password}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <button type="button" onClick={() => { setEmail(''); setPassword(''); setRole('staff'); }}>
              Reset
            </button>
          </div>

          {error && <div className="error-message" style={{ color: '#dc3545', marginTop: 12 }}>{error}</div>}
          {success && <div className="success-message" style={{ color: '#28a745', marginTop: 12 }}>{success}</div>}
        </form>
      </div>

      <div className="patients-table-wrapper">
        <table className="patients-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="no-data">No users found</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td>
                  <div className="actions">
                    <button className="delete-btn" onClick={() => handleDelete(u._id)} disabled={deletingId === u._id}>
                      {deletingId === u._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
