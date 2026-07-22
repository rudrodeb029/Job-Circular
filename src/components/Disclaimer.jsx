import React from 'react';
import { Info } from './Icons';

export default function Disclaimer() {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1.5px solid var(--border-light)',
      borderRadius: '16px',
      padding: '16px',
      margin: '20px 0 10px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706' }}>
        <Info size={20} color="#d97706" />
        <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Disclaimer / সতর্কীকরণ
        </span>
      </div>

      <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '8px', fontWeight: 500 }}>
          <strong>English:</strong> This app (Job Circular) is an independent private platform. It is <strong>NOT</strong> affiliated with, authorized by, or endorsed by the government of Bangladesh or any of its ministries/entities. We do not represent any government organization. All government-related job notices shown here are collected from public official channels and newspapers.
        </p>
        <p style={{ marginBottom: '12px', fontWeight: 500 }}>
          <strong>বাংলা:</strong> এই অ্যাপটি (জব সার্কুলার) একটি স্বাধীন বেসরকারি প্ল্যাটফর্ম। এটি বাংলাদেশ সরকার বা এর কোনো মন্ত্রণালয়/সংস্থার সাথে <strong>কোনোভাবেই সংযুক্ত বা অনুমোদিত নয়</strong>। আমরা কোনো সরকারি সেবা বা সংস্থার প্রতিনিধিত্ব করি না। অ্যাপে প্রদর্শিত সকল সরকারি চাকরির বিজ্ঞপ্তি বিভিন্ন দৈনিক পত্রিকা এবং সরকারি ওয়েবসাইট থেকে সংগ্রহ করা হয়েছে।
        </p>

        <div style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '10px',
          marginTop: '6px'
        }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Official Information Sources / তথ্যের সরকারি উৎসসমূহ:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
            <a href="https://bangladesh.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '11px' }}>
              • bangladesh.gov.bd
            </a>
            <a href="https://bpsc.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '11px' }}>
              • bpsc.gov.bd
            </a>
            <a href="https://mopa.gov.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '11px' }}>
              • mopa.gov.bd
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
