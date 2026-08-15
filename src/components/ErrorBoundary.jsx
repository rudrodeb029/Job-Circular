import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f8fafc',
          color: '#1e293b',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>⚠️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
            সাময়িক সমস্যা দেখা দিয়েছে
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', maxWidth: '320px', lineHeight: 1.5 }}>
            পৃষ্ঠাটি লোড করার সময় একটি ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন বা হোম পেজে ফিরে যান।
          </p>
          {this.state.error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', maxWidth: '340px', wordBreak: 'break-all', textAlign: 'left', marginBottom: '20px' }}>
              <strong>Error:</strong> {String(this.state.error?.message || this.state.error)}
              {this.state.errorInfo?.componentStack && (
                <pre style={{ marginTop: '8px', fontSize: '9px', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#2563eb',
                color: 'white',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🔄 রিফ্রেশ করুন
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: 'white',
                color: '#475569',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🏠 হোমে যান
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
