import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';

export default function AiManager() {
  const { dispatch } = useAdminContext();

  // Multi-API Configuration
  const [activeProvider, setActiveProvider] = useState(localStorage.getItem('ai_provider') || 'openrouter');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [openRouterKey, setOpenRouterKey] = useState(localStorage.getItem('openrouter_api_key') || '');

  // Specific OpenRouter Free Models
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('openrouter_model') || 'nvidia/nemotron-3-ultra-550b-a55b:free');
  const freeModels = [
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nvidia Nemotron 550B (Ultra Free)' },
    { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nvidia Nemotron 120B (Super Free)' },
    { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google Gemma 4 26B (Free)' },
    { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B (Free)' },
    { id: 'openai/gpt-oss-20b:free', name: 'OpenAI GPT-OSS 20B (Free)' },
    { id: 'nvidia/nemotron-3-embed-1b:free', name: 'Nvidia Nemotron Embed 1B (Free)' },
    { id: 'google/gemini-flash-1.5-free:experimental', name: 'Gemini Flash 1.5 (Free)' }
  ];

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  const handleSaveConfigs = () => {
    localStorage.setItem('ai_provider', activeProvider);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('openrouter_api_key', openRouterKey);
    localStorage.setItem('openrouter_model', selectedModel);
    showStatus('success', 'Configurations for ' + activeProvider + ' saved!');
  };

  const testConnection = async () => {
    setTestLoading(true);
    const key = activeProvider === 'gemini' ? geminiKey : openRouterKey;
    if (!key) {
        showStatus('error', 'Enter API Key first');
        setTestLoading(false);
        return;
    }

    try {
        if (activeProvider === 'gemini') {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            await model.generateContent("hi");
        } else {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + key,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": selectedModel,
                    "messages": [{ "role": "user", "content": "hi" }],
                    "max_tokens": 5
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
        }
        showStatus('success', activeProvider + ' is ready and working!');
    } catch (err) {
        showStatus('error', 'Test Failed: ' + err.message);
    } finally {
        setTestLoading(false);
    }
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
        "Content-Type": "application/json",
        "HTTP-Referer": "https://job-circular-75dbb.web.app",
        "X-Title": "Live Circular Pro Admin"
      },
      body: JSON.stringify({
        "model": selectedModel,
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
    if (!currentKey) return showStatus('error', 'Please configure ' + activeProvider + ' API key');
    if (!prompt) return showStatus('error', 'Please provide job information to analyze.');

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

      const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jobData = JSON.parse(cleanedJson);
      setResult(jobData);
      showStatus('success', 'Content generated using ' + selectedModel);
    } catch (error) {
      console.error(error);
      showStatus('error', 'Generation failed: ' + error.message);
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
    showStatus('success', 'Job Circular posted to live app!');
    setResult(null);
    setPrompt('');
  };

  return (
    <div className="admin-page" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🤖</span> AI Manager Pro
        </h1>
        <button
            onClick={testConnection}
            disabled={testLoading}
            style={{ padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)' }}
        >
            {testLoading ? '⏳ Testing...' : '⚡ Test API Connection'}
        </button>
      </div>

      {status.message && (
        <div className="animate-fade-in" style={{ padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', background: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? '#166534' : '#991b1b', fontWeight: '600', border: '1px solid ' + (status.type === 'success' ? '#bbf7d0' : '#fecaca'), display: 'flex', alignItems: 'center', gap: '10px' }}>
          {status.type === 'success' ? '✅' : '❌'} {status.message}
        </div>
      )}

      <div className="admin-chart-card" style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '20px', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            Select AI Engine & Model
        </h3>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div
                onClick={() => setActiveProvider('gemini')}
                style={{ flex: 1, padding: '20px', borderRadius: '15px', border: activeProvider === 'gemini' ? '3px solid #1a56db' : '1px solid #e2e8f0', background: activeProvider === 'gemini' ? '#eff6ff' : '#ffffff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
                <div style={{ fontWeight: '900', fontSize: '14px', color: activeProvider === 'gemini' ? '#1a56db' : '#64748b' }}>GOOGLE GEMINI</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Direct integration</div>
            </div>
            <div
                onClick={() => setActiveProvider('openrouter')}
                style={{ flex: 1, padding: '20px', borderRadius: '15px', border: activeProvider === 'openrouter' ? '3px solid #1a56db' : '1px solid #e2e8f0', background: activeProvider === 'openrouter' ? '#eff6ff' : '#ffffff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
                <div style={{ fontWeight: '900', fontSize: '14px', color: activeProvider === 'openrouter' ? '#1a56db' : '#64748b' }}>OPENROUTER FREE</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Nvidia / Gemma / GPT</div>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeProvider === 'gemini' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: '#4b5563' }}>GOOGLE API KEY</label>
                <input
                    type="password"
                    placeholder="Enter your Google Gemini API Key"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', fontSize: '14px' }}
                />
            </div>
          ) : (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: '#4b5563' }}>OPENROUTER API KEY</label>
                    <input
                        type="password"
                        placeholder="sk-or-v1-..."
                        value={openRouterKey}
                        onChange={(e) => setOpenRouterKey(e.target.value)}
                        style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', fontSize: '14px' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: '#4b5563' }}>SELECT FREE HIGH-PERFORMANCE MODEL</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                    >
                        {freeModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            </>
          )}
          <button onClick={handleSaveConfigs} style={{ width: '100%', padding: '16px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 12px rgba(26, 86, 219, 0.3)', transition: 'transform 0.2s' }}>
            💾 Save & Apply AI Config
          </button>
        </div>
      </div>

      <div className="admin-chart-card" style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '15px' }}>Job Circular Information</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Describe the job or paste raw text from a website. AI will analyze and create a professional post.</p>
        <textarea
          placeholder="Example: 'Create circular for Bank Asia PO post, vacancy 50, location all over Bangladesh, salary 50000, deadline June 2025'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: '100%', height: '180px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '15px', marginBottom: '25px', resize: 'vertical', fontSize: '15px', lineHeight: '1.7', background: '#fcfcfc' }}
        />

        <button
          onClick={generatePost}
          disabled={loading}
          style={{ width: '100%', padding: '18px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '900', fontSize: '18px', boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)' }}
        >
          {loading ? '🤖 AI Generating Circular...' : '✨ Magic Create Post'}
        </button>
      </div>

      {result && (
        <div className="admin-chart-card animate-fade-in" style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', marginTop: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '2px solid #1a56db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, color: '#1a56db', fontWeight: '900' }}>AI ANALYZED PREVIEW</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>App Category:</span>
                <select
                    value={result.categoryId}
                    onChange={(e) => setResult({...result, categoryId: e.target.value})}
                    style={{ padding: '8px 16px', background: '#eff6ff', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #bfdbfe', color: '#1e40af', fontWeight: '800' }}
                >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Job Title (Bengali)</label>
              <input value={result.title} onChange={(e) => setResult({...result, title: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '700', fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Organization Name</label>
              <input value={result.organization} onChange={(e) => setResult({...result, organization: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '600' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Total Vacancy</label>
              <input value={result.vacancy} onChange={(e) => setResult({...result, vacancy: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Application Deadline</label>
              <input type="date" value={result.deadline} onChange={(e) => setResult({...result, deadline: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 'bold' }} />
            </div>
            <div>
                <label style={{ fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Salary Info</label>
                <input value={result.salary} onChange={(e) => setResult({...result, salary: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
            </div>
          </div>

          <button
            onClick={handlePost}
            style={{ width: '100%', padding: '20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '900', fontSize: '18px', boxShadow: '0 10px 20px rgba(22, 163, 74, 0.4)', transition: 'all 0.3s' }}
          >
            🚀 Publish Circular & Push to All Users
          </button>
        </div>
      )}
    </div>
  );
}
