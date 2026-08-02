import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';

export default function AiManager() {
  const { dispatch } = useAdminContext();

  // Multi-API Configuration
  const [activeProvider, setActiveActiveProvider] = useState(localStorage.getItem('ai_provider') || 'gemini');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [openRouterKey, setOpenRouterKey] = useState(localStorage.getItem('openrouter_api_key') || '');

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const handleSaveConfigs = () => {
    localStorage.setItem('ai_provider', activeProvider);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('openrouter_api_key', openRouterKey);
    showStatus('success', 'AI configurations saved successfully!');
  };

  const generateWithGemini = async (fullPrompt) => {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const genResult = await model.generateContent(fullPrompt);
    const response = await genResult.response;
    return response.text();
  };

  const generateWithOpenRouter = async (fullPrompt) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + openRouterKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-flash-1.5", // Default model for OpenRouter
        "messages": [
          { "role": "user", "content": fullPrompt }
        ]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  };

  const generatePost = async () => {
    const currentKey = activeProvider === 'gemini' ? geminiKey : openRouterKey;
    if (!currentKey) return showStatus('error', 'Please enter API Key for ' + activeProvider);
    if (!prompt) return showStatus('error', 'Please enter a description of the job.');

    setLoading(true);
    try {
      const fullPrompt = "You are an expert job circular creator. Based on the following information, create a professional job circular in JSON format. Information: " + prompt +
        ". The JSON must strictly follow this structure: { \"title\": \"Title in Bengali\", \"titleEn\": \"Title in English\", \"organization\": \"Organization in Bengali\", \"organizationEn\": \"Organization in English\", \"categoryId\": \"Select from: " + categories.map(c => c.id).join(', ') + "\", \"jobType\": \"Job Type (e.g. সরকারি, ব্যাংক)\", \"location\": \"Location in Bengali\", \"vacancy\": \"Number of vacancies\", \"salary\": \"Salary information in Bengali\", \"deadline\": \"YYYY-MM-DD\", \"description\": \"Short description in Bengali\", \"requirements\": [\"Requirement 1 in Bengali\", \"Requirement 2 in Bengali\"] }. Return ONLY the raw JSON. No markdown formatting.";

      let text = "";
      if (activeProvider === 'gemini') {
        text = await generateWithGemini(fullPrompt);
      } else {
        text = await generateWithOpenRouter(fullPrompt);
      }

      // Clean text from potential markdown backticks
      const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jobData = JSON.parse(cleanedJson);
      setResult(jobData);
      showStatus('success', 'AI Data Generated via ' + activeProvider);
    } catch (error) {
      console.error(error);
      showStatus('error', 'AI Generation failed (' + activeProvider + '): ' + error.message);
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
      <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>🤖 AI Multi-Manager</h1>

      {status.message && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', background: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? '#166534' : '#991b1b' }}>
          {status.message}
        </div>
      )}

      {/* Multi-API Configuration Section */}
      <div className="admin-chart-card" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '15px' }}>Provider Configuration</h3>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div
                onClick={() => setActiveActiveProvider('gemini')}
                style={{ flex: 1, padding: '15px', borderRadius: '8px', border: activeProvider === 'gemini' ? '2px solid #1a56db' : '1px solid #e2e8f0', background: activeProvider === 'gemini' ? '#eff6ff' : '#ffffff', cursor: 'pointer', textAlign: 'center' }}
            >
                <div style={{ fontWeight: 'bold', color: activeProvider === 'gemini' ? '#1a56db' : '#64748b' }}>Google Gemini</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Direct SDK</div>
            </div>
            <div
                onClick={() => setActiveActiveProvider('openrouter')}
                style={{ flex: 1, padding: '15px', borderRadius: '8px', border: activeProvider === 'openrouter' ? '2px solid #1a56db' : '1px solid #e2e8f0', background: activeProvider === 'openrouter' ? '#eff6ff' : '#ffffff', cursor: 'pointer', textAlign: 'center' }}
            >
                <div style={{ fontWeight: 'bold', color: activeProvider === 'openrouter' ? '#1a56db' : '#64748b' }}>OpenRouter</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>GPT-4 / Claude / Llama</div>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeProvider === 'gemini' ? (
            <input
                type="password"
                placeholder="Enter Google Gemini API Key"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
            />
          ) : (
            <input
                type="password"
                placeholder="Enter OpenRouter API Key (sk-or-...)"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
            />
          )}
          <button onClick={handleSaveConfigs} style={{ alignSelf: 'flex-start', padding: '10px 25px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save Configuration
          </button>
        </div>
      </div>

      {/* Generator Section */}
      <div className="admin-chart-card" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Generate using {activeProvider === 'gemini' ? 'Gemini' : 'OpenRouter'}</h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '15px' }}>Paste job details below. The active provider will analyze and format the post.</p>

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
          {loading ? 'AI analyzing info...' : '✨ Generate Circular Data'}
        </button>
      </div>

      {/* Preview Section */}
      {result && (
        <div className="admin-chart-card" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', marginTop: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>AI Generated Preview</h3>
            <select
                value={result.categoryId}
                onChange={(e) => setResult({...result, categoryId: e.target.value})}
                style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #e2e8f0' }}
            >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Title (Bengali)</label>
              <input value={result.title} onChange={(e) => setResult({...result, title: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Organization (Bengali)</label>
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
            <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Salary</label>
                <input value={result.salary} onChange={(e) => setResult({...result, salary: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
            </div>
          </div>

          <button
            onClick={handlePost}
            style={{ width: '100%', padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🚀 Confirm & Post to Live App
          </button>
        </div>
      )}
    </div>
  );
}
