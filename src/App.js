import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthProvider';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AddPatientForm from './components/AddPatientForm';
import PatientInstance from './components/PatientInstance';
import './App.css';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-patient"
            element={
              <PrivateRoute>
                <AddPatientForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/:id"
            element={
              <PrivateRoute>
                <PatientInstance />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;