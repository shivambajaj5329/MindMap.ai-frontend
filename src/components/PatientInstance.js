import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './css/PatientInstance.css';

function PatientInstance() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSummaryIndex, setExpandedSummaryIndex] = useState(null);
  const [summaryLabel, setSummaryLabel] = useState('');
  const [feedback, setFeedback] = useState({});
  const [context, setContext] = useState('');
  const [therapyDate, setTherapyDate] = useState('');
  const [error, setError] = useState('');
  const [sentimentData, setSentimentData] = useState([]);
  const [patient, setPatient] = useState({});
  const [deidentifiedText, setDeidentifiedText] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      const userId = auth.currentUser.uid;
      const patientDoc = doc(db, 'users', userId, 'patients', id);
      const patientData = await getDoc(patientDoc);
      if (patientData.exists()) {
        const patient = patientData.data();
        setPatient(patient);
        setSummaries(patient.summaries || []);
        setSentimentData(patient.sentimentData || []);
      }
    };

    fetchPatientData();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setDeidentifiedText('');
  };

  const handleLabelChange = (e) => setSummaryLabel(e.target.value);
  const handleContextChange = (e) => setContext(e.target.value);
  const handleDateChange = (e) => setTherapyDate(e.target.value);

  const textToFile = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    return new File([blob], filename, { type: 'text/plain' });
  };

  const handleDeidentify = async () => {
    if (!file) {
      setError('No file uploaded. Please upload a file first!');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'gemini');
  
      const response = await axios.post(process.env.REACT_APP_API_ENDPOINT_DEIDENTIFY, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      setDeidentifiedText(response.data.deidentifiedText);
    } catch (error) {
      console.error('Deidentification error:', error.response || error);
      setError('Error deidentifying file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!deidentifiedText) {
      setError('Please deidentify the file first.');
      return;
    }

    if (!therapyDate) {
      setError('Please select a therapy date!');
      return;
    }

    setLoading(true);

    try {
      const userId = auth.currentUser.uid;
      const formData = new FormData();
      const deidentifiedFile = textToFile(deidentifiedText, 'deidentified_text.txt');
      formData.append('file', deidentifiedFile);
      formData.append('context', context || 'No additional context provided');
      formData.append('label', summaryLabel || `Summary_${therapyDate}`);
      formData.append('model', 'gemini');
      
      const response = await axios.post(process.env.REACT_APP_API_ENDPOINT_UPLOAD, formData);

      const newSummary = {
        label: summaryLabel || `Summary_${therapyDate}`,
        date: new Date().toISOString(),
        summary: response.data.summary,
        sentiment: response.data.sentiment,
        insights: Array.isArray(response.data.insights) ? response.data.insights : [],
        context: context,
        therapyDate: therapyDate
      };

      const patientDoc = doc(db, 'users', userId, 'patients', id);
      await updateDoc(patientDoc, {
        summaries: arrayUnion(newSummary),
        sentimentData: arrayUnion({ date: new Date().toISOString(), sentiment: response.data.sentiment })
      });

      setSummaries([...summaries, newSummary]);
      setSentimentData([...sentimentData, { date: new Date().toISOString(), sentiment: response.data.sentiment }]);
      setSummaryLabel('');
      setContext('');
      setTherapyDate('');
      setFile(null);
      setDeidentifiedText('');
      setError('');
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Error generating insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSummaryExpansion = (index) => {
    setExpandedSummaryIndex(expandedSummaryIndex === index ? null : index);
  };

  const handleDelete = async (index) => {
    const newSummaries = summaries.filter((_, i) => i !== index);
    const newSentimentData = sentimentData.filter((_, i) => i !== index);

    setSummaries(newSummaries);
    setSentimentData(newSentimentData);

    const userId = auth.currentUser.uid;
    const patientDoc = doc(db, 'users', userId, 'patients', id);
    await updateDoc(patientDoc, {
      summaries: newSummaries,
      sentimentData: newSentimentData
    });
  };

  const handleFeedback = (index, type) => {
    setFeedback({ ...feedback, [index]: type });
  };

  const highlightRedacted = (text) => {
    return text
      .replace(/\[REDACTED\]/g, '<span class="redacted">[REDACTED]</span>')
      .replace(/\n/g, '<br><br>'); // Replace newline characters with <br> tags
  };

  return (
    <div className="patient-instance">
      <div className="patient-header">
        <div className="patient-details">
          <div className="patient-info">
            <h1>Patient: {patient.firstName} {patient.lastName}</h1>
            <p>Age: {patient.age}</p>
            <p>City: {patient.city}</p>
          </div>
          <img src={patient.image} alt={`${patient.firstName} ${patient.lastName}`} className="patient-image" />
        </div>
      </div>
      <div className="main-content">
        <div className="left-column">
          <div className="upload-container">
            <div className="file-input-wrapper">
              <label htmlFor="file-upload" className="file-upload-label">
                📁 Choose File
              </label>
              <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} />
              {file && <p className="file-name">{file.name}</p>}
            </div>
            <div>
              <label htmlFor="summaryLabel">Header:</label>
              <input
                type="text"
                id="summaryLabel"
                placeholder="Enter summary label"
                value={summaryLabel}
                onChange={handleLabelChange}
              />
            </div>
            <div>
              <label htmlFor="context">Additional Context:</label>
              <textarea
                id="context"
                placeholder="Enter additional context"
                value={context}
                onChange={handleContextChange}
              />
            </div>
            <div>
              <label htmlFor="therapyDate">Therapy Date:</label>
              <input
                type="date"
                id="therapyDate"
                value={therapyDate}
                onChange={handleDateChange}
              />
            </div>
            <button onClick={handleDeidentify} disabled={loading || !file}>
              {loading ? 'Deidentifying...' : 'Deidentify'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
        <div className="right-column">
          <div className="deidentified-text-container">
            <h3>Deidentified Text</h3>
            <div 
              className="deidentified-text-area"
              contentEditable={true}
              dangerouslySetInnerHTML={{ __html: highlightRedacted(deidentifiedText) }}
              onInput={(e) => setDeidentifiedText(e.target.innerText)}
            />
            {deidentifiedText && (
              <div className="button-container">
                <button onClick={handleSubmit}>⬆️ Generate Insights</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {loading && <p>Processing...</p>}
      <div className="summary-list">
        {summaries.map((summary, index) => (
          <div key={index} className="summary-container">
            <div className="summary-header" onClick={() => toggleSummaryExpansion(index)}>
              <span>{summary.label}</span>
              <span>{summary.therapyDate}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
              >
                <FaTrash />
              </button>
            </div>
            {expandedSummaryIndex === index && (
              <div className="summary-details">
                <h2>Summary</h2>
                <p>{summary.summary}</p>
                <h2>Sentiment Analysis</h2>
                <p>{summary.sentiment}</p>
                <h2>Insights</h2>
                <ul>
                  {summary.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
                <h2>Additional Context</h2>
                <p>{summary.context}</p>
                <div className="feedback-buttons">
                  <button onClick={() => handleFeedback(index, 'thumbs-up')}>👍</button>
                  <button onClick={() => handleFeedback(index, 'thumbs-down')}>👎</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientInstance;
