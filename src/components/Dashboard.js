import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { FaTrash } from 'react-icons/fa';
import { auth, db } from '../firebase';
import './css/Dashboard.css';
import { FaBirthdayCake, FaCity } from 'react-icons/fa';

function usePreventBackNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      navigate('/dashboard', { replace: true });
    };

    window.history.pushState(null, '', location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location]);
}

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  usePreventBackNavigation();

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const unsubscribe = onSnapshot(collection(db, 'users', userId, 'patients'), (snapshot) => {
      const patientsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPatients(patientsData);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate('/');
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  const handleDeletePatient = async (patientId) => {
    const userId = auth.currentUser.uid;
    await deleteDoc(doc(db, 'users', userId, 'patients', patientId));
  };

  return (
    <div className="dashboard">
      <h1>Patient Dashboard</h1>
      <div className="action-buttons">
        <Link to="/add-patient">
          <button className="add-patient-button">Add New Patient</button>
        </Link>
        <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>
      </div>
      <div className="patient-list">
  {patients.map((patient) => (
    <div className="patient-card" key={patient.id}>
      <Link to={`/patient/${patient.id}`}>
        <div className="patient-image-wrapper">
          <img src={patient.image} alt={`${patient.firstName} ${patient.lastName}`} className="patient-image" />
        </div>
        <h2>{patient.firstName} {patient.lastName}</h2>
        <p><FaBirthdayCake /> Age: {patient.age}</p>
        <p><FaCity /> {patient.city}</p>
      </Link>
      <button className="delete-button" onClick={() => handleDeletePatient(patient.id)}>
        <FaTrash />
      </button>
    </div>
  ))}
</div>
    </div>
  );
}

export default Dashboard;