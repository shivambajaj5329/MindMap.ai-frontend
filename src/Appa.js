import React, { useState } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSummaryIndex, setExpandedSummaryIndex] = useState(null);
  const [summaryLabel, setSummaryLabel] = useState('');
  const [feedback, setFeedback] = useState({}); // Store feedback
  const [context, setContext] = useState(''); // Store additional context
  const [error, setError] = useState(''); // Store error message

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(''); // Clear error message when a file is selected
  };

  const handleLabelChange = (e) => {
    setSummaryLabel(e.target.value);
  };

  const handleContextChange = (e) => {
    setContext(e.target.value);
  };

  const handleSubmit = () => {
    if (!file) {
      setError('No file uploaded. Please upload a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context || 'No additional context provided');

    let defaultLabel = `${file.name.split('.')[0]}_${new Date().toLocaleDateString()}`;
    const label = summaryLabel || defaultLabel;
    formData.append('label', label);

    setLoading(true); // Set loading state

    axios.post('http://localhost:5001/upload', formData)
      .then(response => {
        const newSummary = {
          label: label,
          date: new Date(),
          summary: response.data.summary,
          sentiment: response.data.sentiment,
          insights: Array.isArray(response.data.insights) ? response.data.insights : [], // Ensure insights is an array
          context: context // Store the additional context
        };
        setSummaries([...summaries, newSummary]);
        setLoading(false); // Clear loading state
        setSummaryLabel(''); // Clear the text input
        setContext(''); // Clear the context input
        setFile(null); // Clear the file input
        setError(''); // Clear error message
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false); // Clear loading state
      });
  };

  const getCurrentDateFormatted = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const toggleSummaryExpansion = (index) => {
    setExpandedSummaryIndex(expandedSummaryIndex === index ? null : index);
  };

  const handleDelete = (index) => {
    const newSummaries = [...summaries];
    newSummaries.splice(index, 1);
    setSummaries(newSummaries);
  };

  const handleFeedback = (index, type) => {
    const newFeedback = { ...feedback, [index]: type };
    setFeedback(newFeedback);
    console.log('Feedback for summary', index, ':', type);
  };

  return (
    <div className="container">
      <h1>Meeting Summary and Insights</h1>
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
        <div className="button-container">
          <button onClick={handleSubmit}>⬆️ Upload File</button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
      {loading && <p>Generating insights for "{summaryLabel || 'Summary'}"...</p>}
      <div className="summary-list">
        {summaries.map((summary, index) => (
          <div key={index} className="summary-container">
            <div className="summary-header">
              <span onClick={() => toggleSummaryExpansion(index)}>{summary.label}</span>
              <span className="summary-date">{getCurrentDateFormatted(summary.date)}</span>
              <button className="delete-button" onClick={() => handleDelete(index)}><FaTrash /></button>
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

export default App;
