import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';

export default function AiManager() {
  const { dispatch } = useAdminContext();
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSaveKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    showStatus('success', 'Gemini API Key saved!');
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const generatePost = async () => {
    if (!apiKey) return showStatus('error', 'Please enter Gemini API Key first.');
    if (!prompt) return showStatus('error', 'Please enter a description of the job.');

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const fullPrompt = "You are an expert job circular creator. Based on the following information, create a professional job circular in JSON format. Information: " + prompt +
        ". The JSON must strictly follow this structure: { \"title\": \"Title in Bengali\", \"titleEn\": \"Title in English\", \"organization\": \"Organization in Bengali\", \"organizationEn\": \"Organization in English\", \"categoryId\": \"Select from: " + categories.map(c => c.id).join(', ') + "\", \"jobType\": \"Job Type (e.g. সরকারি, ব্যাংক)\", \"location\": \"Location in Bengali\", \"vacancy\": \"Number of vacancies\", \"salary\": \"Salary information in Bengali\", \"deadline\": \"YYYY-MM-DD\", \"description\": \"Short description in Bengali\", \"requirements\": [\"Requirement 1 in Bengali\", \"Requirement 2 in Bengali\"] }. Return ONLY the raw JSON. No markdown formatting.";

      const genResult = await model.generateContent(fullPrompt);
      const response = await genResult.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const jobData = JSON.parse(text);
      setResult(jobData);
    } catch (error) {
      console.error(error);
      showStatus('error', 'AI Generation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = () => {
    if (!result) return;
    const finalData = {
      ...result,
      id: "job_" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postedAt: new Date().toISOString().split('T')[0],
      status: 'Active',
      images: []
    };
    dispatch({ type: 'ADD_JOB', payload: finalData });
    showStatus('success', 'Job Circular posted successfully!');
    setResult(null);
    setPrompt('');
  };

  return (
    <div className="admin-page" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>🤖 AI Manager</h1>

      {status.message && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', background: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? '#166534' : '#991b1b' }}>
          {status.message}
        </div>
      )}

      {/* API Key Section */}
      <div className="admin-chart-card" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '10px' }}>Gemini API Configuration</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="password"
            placeholder="Enter Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          />
          <button onClick={handleSaveKey} style={{ padding: '10px 20px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Key</button>
        </div>
      </div>

      {/* Generator Section */}
      <div className="admin-chart-card" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Generate Job Circular</h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '15px' }}>Describe the job circular you want to create (e.g., "Bangladesh Bank Assistant Director circular 2024"). AI will handle the rest.</p>

        <textarea
          placeholder="Paste job details here or describe the post..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: '100%', height: '120px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px', resize: 'vertical' }}
        />

        <button
          onClick={generatePost}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: loading ? '#94a3b8' : '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Generating...' : '✨ Generate Circular Data'}
        </button>
      </div>

      {/* Preview Section */}
      {result && (
        <div className="admin-chart-card" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', marginTop: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>AI Generated Preview</h3>
            <span style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{result.categoryId}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Title (BN)</label>
              <input value={result.title} onChange={(e) => setResult({...result, title: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Organization (BN)</label>
              <input value={result.organization} onChange={(e) => setResult({...result, organization: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Vacancy</label>
              <input value={result.vacancy} onChange={(e) => setResult({...result, vacancy: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Deadline</label>
              <input type="date" value={result.deadline} onChange={(e) => setResult({...result, deadline: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
            </div>
          </div>

          <button
            onClick={handlePost}
            style={{ width: '100%', padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🚀 Post Circular Instantly
          </button>
        </div>
      )}
    </div>
  );
}
