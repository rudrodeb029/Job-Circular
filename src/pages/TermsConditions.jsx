import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from '../components/Icons';
import BottomNav from '../components/BottomNav';

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>Terms & Conditions</h1>
      </div>

      <div className="page-content animate-fade-in">
        <div className="card" style={{ marginBottom: '20px', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Usage Terms</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Effective: July 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                1. Disclaimer / সাধারণ নিয়মাবলি
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Job Circulars BD aggregates job posts from government gazettes, corporate sites, and newspapers. Candidates are advised to verify details with official sources before submitting applications.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px', fontStyle: 'italic' }}>
                জব সার্কুলার অ্যাপের তথ্যসমূহ সরকারি গেজেট ও বিভিন্ন বিশ্বস্ত সূত্র থেকে নেওয়া হয়। আবেদনের পূর্বে মূল বিজ্ঞপ্তি ভালোভাবে যাচাই করে নেওয়ার অনুরোধ রইল।
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                2. User Obligations / ব্যবহারকারীর দায়িত্ব
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You must provide accurate profile details to get relevant notifications. Any misuse of links, templates, or automated query generation is strictly prohibited.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px', fontStyle: 'italic' }}>
                সঠিক নোটিফিকেশন পেতে আপনার প্রোফাইলে সঠিক তথ্য প্রদান করুন। আমাদের চাকুরির লিঙ্ক বা ছবিগুলোর কোনো প্রকার বাণিজ্যিক অপব্যবহার নিষিদ্ধ।
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                3. Limitation of Liability / দায়বদ্ধতার সীমাবদ্ধতা
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We are not responsible for any issues arising from delayed applications, technical errors on official apply sites, or changes in circular deadlines.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px', fontStyle: 'italic' }}>
                অফিসিয়াল ওয়েবসাইটের কোনো সমস্যা বা চাকুরির ডেডলাইন পরিবর্তনের জন্য জব সার্কুলার অ্যাপ কর্তৃপক্ষ দায়ী থাকবে না।
              </p>
            </section>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
