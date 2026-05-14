import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/PatientsList';
import PatientForm from './pages/PatientForm';
import PatientDetails from './pages/PatientDetails';
import Appointments from './pages/Appointments';
import AppointmentForm from './pages/AppointmentForm';
import AdminUsers from './pages/AdminUsers';
import AdminRoute from './components/AdminRoute';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Patients Routes */}
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/add"
            element={
              <ProtectedRoute>
                <PatientForm isEdit={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id/edit"
            element={
              <ProtectedRoute>
                <PatientForm isEdit={true} />
              </ProtectedRoute>
            }
          />

          {/* Appointments Routes */}
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/add"
            element={
              <ProtectedRoute>
                <AppointmentForm isEdit={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:id/edit"
            element={
              <ProtectedRoute>
                <AppointmentForm isEdit={true} />
              </ProtectedRoute>
            }
          />
          {/* Admin-only user management */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
