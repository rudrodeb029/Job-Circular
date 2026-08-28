import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';

export default function TermsConditions() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  return (
    <div className="page" style={{ background: 'var(--bg-secondary)', paddingBottom: '100px' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: '15px', fontWeight: 800 }}>
          {isEn ? 'Terms & Conditions' : 'ব্যবহারের শর্তাবলী (Terms & Conditions)'}
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        {!isEn ? (
          /* 🇧🇩 BANGLA MODE CONTENT */
          <div className="card animate-fade-in" style={{ marginBottom: '20px', borderRadius: '24px', borderTop: '4px solid var(--primary)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
                <FileText size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>ব্যবহারের শর্তাবলী (Terms of Service)</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>কার্যকর তারিখ: আগস্ট ২০২৬</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ১. কোনো সরকারি বা প্রাতিষ্ঠানিক সম্পৃক্ততা নেই (No Government Affiliation)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  লাইভ সার্কুলার একটি স্বাধীন ও বেসরকারি চাকরির তথ্যসেবা অ্যাপ। এই অ্যাপটি বাংলাদেশ সরকার, কোনো সরকারি অধিদপ্তর, মন্ত্রণালয় বা নিয়োগকারী বোর্ডের অফিশিয়াল অ্যাপ নয়। অ্যাপে থাকা সকল তথ্য শিক্ষামূলক ও তথ্য জানানোর উদ্দেশ্যে পরিবেশিত।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ২. তথ্যের সঠিকতা ও সত্যতা যাচাই (Information Accuracy & Verification)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  আমরা সকল চাকরির সার্কুলার, পরীক্ষার তারিখ ও ফলাফল অফিশিয়াল ওয়েবসাইট ও জাতীয় পত্রিকা থেকে সংগ্রহ করি। আবেদনে নাম জমা দেওয়ার পূর্বে অবশ্যই নিয়োগকারী প্রতিষ্ঠানের নিজস্ব অফিসিয়াল সার্কুলার থেকে শতভাগ সত্যতা যাচাই করে নেওয়ার অনুরোধ করা হলো।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ৩. কপিরাইট নীতি ও কন্টেন্ট অপসারণ (Copyright Policy & Takedown)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  বিগত সালের পরীক্ষার মূল প্রশ্নপত্রের কপিরাইট সংশ্লিষ্ট পরীক্ষা কর্তৃপক্ষের। আমরা কোনো বাণিজ্যিক বই বা প্রকাশনীর কপিরাইট কন্টেন্ট অনুমোদন করি না। আপনার কোনো কপিরাইট কন্টেন্ট অপসারণ করতে <strong>rudrodeb029@gmail.com</strong> ইমেইলে যোগাযোগ করুন, আমরা ২৪-৪৮ ঘণ্টার মধ্যে ব্যবস্থা নেব।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ৪. দায়বদ্ধতার সীমাবদ্ধতা (Limitation of Liability)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  অনলাইন আবেদন পোর্টালে কারিগরি ত্রুটি, টাইপিং মিস্টেক বা নোটিফিকেশন পৌঁছাতে বিলম্বের কারণে ব্যবহারকারীর যেকোনো ক্ষতির জন্য এই অ্যাপ কর্তৃপক্ষ দায়ী থাকবে না।
                </p>
              </section>

              <section style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ৫. শর্তাবলীর সম্মতি (Acceptance of Terms)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                  লাইভ সার্কুলার ব্যবহার করার মাধ্যমে আপনি আমাদের শর্তাবলী ও নীতি মেনে নিচ্ছেন। যেকোনো প্রশ্ন থাকলে আমাদের ইমেইল করুন: <strong>rudrodeb029@gmail.com</strong>।
                </p>
              </section>
            </div>
          </div>
        ) : (
          /* 🇬🇧 ENGLISH MODE CONTENT */
          <div className="card animate-fade-in" style={{ marginBottom: '20px', borderRadius: '24px', borderTop: '4px solid var(--primary)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
                <FileText size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Terms of Service</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Effective: August 2026</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  1. Non-Affiliation Disclaimer
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Live Circular is an independent, non-governmental job information platform. We are NOT affiliated with the Government of Bangladesh or any specific government agency. All information provided is for educational and informational purposes only.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  2. Information Accuracy & Verification
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  We aggregate job circulars, exam dates, and results from public official gazettes, official portals, and national newspapers. Users are required to verify all details on official websites before submitting any job application.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  3. Copyright & Takedown Policy
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Original exam question copyrights belong to their respective conducting authorities. We do not publish scanned copyrighted material from commercial guidebooks. For takedown requests, contact <strong>rudrodeb029@gmail.com</strong> (processed within 24-48 hours).
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  4. Limitation of Liability
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  We are not responsible for technical issues on official application portals, changes in recruitment deadlines, or delays in push notification delivery.
                </p>
              </section>

              <section style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  5. Acceptance of Terms
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                  By accessing or using the Live Circular app, you acknowledge and agree to these terms. For support, email: <strong>rudrodeb029@gmail.com</strong>.
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
