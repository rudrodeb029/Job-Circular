import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';

export default function AiManager() {
  const { dispatch } = useAdminContext();

  // Pre-configured User Key
  const PROVIDED_KEY = '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';

  // Multi-API Configuration
  const [activeProvider, setActiveProvider] = useState(localStorage.getItem('ai_provider') || 'openrouter');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [openRouterKey, setOpenRouterKey] = useState(localStorage.getItem('openrouter_api_key') || PROVIDED_KEY);

  // OpenRouter Free Models
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('openrouter_model') || 'google/gemini-flash-1.5-free:experimental');
  const freeModels = [
    { id: 'google/gemini-flash-1.5-free:experimental', name: 'Gemini Flash 1.5 (Free)' },
    { id: 'google/gemini-flash-1.5-8b-exp-0827:free', name: 'Gemini Flash 8B (Free)' },
    { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)' },
    { id: 'mistralai/pixtral-12b:free', name: 'Pixtral 12B (Free)' },
    { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B (Free)' },
    { id: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi 3 Mini (Free)' }
  ];

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    // Ensure provided key is saved if no key exists
    if (!localStorage.getItem('openrouter_api_key')) {
        localStorage.setItem('openrouter_api_key', PROVIDED_KEY);
    }
  }, []);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  const handleSaveConfigs = () => {
    localStorage.setItem('ai_provider', activeProvider);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('openrouter_api_key', openRouterKey);
    localStorage.setItem('openrouter_model', selectedModel);
    showStatus('success', 'AI configurations saved successfully!');
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
        showStatus('success', activeProvider + ' API is working correctly!');
    } catch (err) {
        showStatus('error', 'API Test Failed: ' + err.message);
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
        "HTTP-Referer": window.location.origin,
        "X-Title": "Job Circular Admin"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>🤖 AI Manager Pro</h1>
        <button
            onClick={testConnection}
            disabled={testLoading}
            style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
            {testLoading ? 'Testing...' : '⚡ Test API Connection'}
        </button>
      </div>

      {status.message && (
        <div style={{ padding: '15px', borderRadius: '10px', marginBottom: '20px', background: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? '#166534' : '#991b1b', fontWeight: '500', border: '1px solid ' + (status.type === 'success' ? '#bbf7d0' : '#fecaca') }}>
          {status.message}
        </div>
      )}

      <div className="admin-chart-card" style={{ background: '#ffffff', padding: '25px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            Provider Configuration
        </h3>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
            <div
                onClick={() => setActiveProvider('gemini')}
                style={{ flex: 1, padding: '18px', borderRadius: '12px', border: activeProvider === 'gemini' ? '2.5px solid #1a56db' : '1.5px solid #e2e8f0', background: activeProvider === 'gemini' ? '#eff6ff' : '#ffffff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
            >
                <div style={{ fontWeight: '800', color: activeProvider === 'gemini' ? '#1a56db' : '#64748b' }}>GOOGLE GEMINI</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Fast Direct SDK</div>
            </div>
            <div
                onClick={() => setActiveProvider('openrouter')}
                style={{ flex: 1, padding: '18px', borderRadius: '12px', border: activeProvider === 'openrouter' ? '2.5px solid #1a56db' : '1.5px solid #e2e8f0', background: activeProvider === 'openrouter' ? '#eff6ff' : '#ffffff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
            >
                <div style={{ fontWeight: '800', color: activeProvider === 'openrouter' ? '#1a56db' : '#64748b' }}>OPENROUTER (FREE)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>GPT-4 / Claude / Llama</div>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {activeProvider === 'gemini' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Gemini API Key</label>
                <input
                    type="password"
                    placeholder="Paste Google Gemini Key"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}
                />
            </div>
          ) : (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>OpenRouter API Key</label>
                    <input
                        type="password"
                        placeholder="sk-or-v1-..."
                        value={openRouterKey}
                        onChange={(e) => setOpenRouterKey(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Select Free Model</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer' }}
                    >
                        {freeModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            </>
          )}
          <button onClick={handleSaveConfigs} style={{ width: '100%', padding: '14px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '10px', boxShadow: '0 4px 12px rgba(26, 86, 219, 0.2)' }}>
            💾 Save Configuration
          </button>
        </div>
      </div>

      <div className="admin-chart-card" style={{ background: '#ffffff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '15px' }}>Write Job Details</h3>
        <textarea
          placeholder="e.g. 'Post circular for Primary Teacher Exam 2024, 5000 seats, deadline Dec 30'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: '100%', height: '150px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px', resize: 'vertical', fontSize: '14px', lineHeight: '1.6' }}
        />

        <button
          onClick={generatePost}
          disabled={loading}
          style={{ width: '100%', padding: '16px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '16px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)' }}
        >
          {loading ? '🤖 AI Analysing Data...' : '✨ Magic Generate Professional Post'}
        </button>
      </div>

      {result && (
        <div className="admin-chart-card animate-fade-in" style={{ background: '#ffffff', padding: '25px', borderRadius: '16px', marginTop: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #1a56db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, color: '#1a56db' }}>Preview & Edit Result</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Category:</span>
                <select
                    value={result.categoryId}
                    onChange={(e) => setResult({...result, categoryId: e.target.value})}
                    style={{ padding: '6px 12px', background: '#eff6ff', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #bfdbfe', color: '#1e40af', fontWeight: 'bold' }}
                >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Job Title (Bengali)</label>
              <input value={result.title} onChange={(e) => setResult({...result, title: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Organization</label>
              <input value={result.organization} onChange={(e) => setResult({...result, organization: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Vacancy</label>
              <input value={result.vacancy} onChange={(e) => setResult({...result, vacancy: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Deadline</label>
              <input type="date" value={result.deadline} onChange={(e) => setResult({...result, deadline: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
            <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Salary</label>
                <input value={result.salary} onChange={(e) => setResult({...result, salary: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
          </div>

          <button
            onClick={handlePost}
            style={{ width: '100%', padding: '18px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '17px', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)' }}
          >
            🚀 Publish Now & Send Push Notification
          </button>
        </div>
      )}
    </div>
  );
}
