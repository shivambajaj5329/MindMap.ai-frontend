import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc,serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import './css/AddPatientForm.css';

function AddPatientForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = auth.currentUser.uid;
    try {
      const imageRef = ref(storage, `users/${userId}/images/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      const patientRef = collection(db, 'users', userId, 'patients');
      await addDoc(patientRef, { firstName, lastName, age, city, image: imageUrl,createdAt: serverTimestamp()
      });

      navigate('/dashboard');
    } catch (error) {
      setError('Failed to add patient. Please try again.');
    }
  };

  return (
    <div className="add-patient-form">
      <h1>Add New Patient</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label htmlFor="age">Age:</label>
        <input
          type="number"
          id="age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />

        <label htmlFor="city">City:</label>
        <input
          type="text"
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <label htmlFor="image" className="file-input-label">
          <div className="file-input-wrapper">
            <span className="file-input-button">Upload Picture</span>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
              required
            />
          </div>
        </label>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <button type="submit">Add Patient</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default AddPatientForm;
