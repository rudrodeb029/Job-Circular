import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft
} from '../components/Icons';
import Disclaimer from '../components/Disclaimer';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';

export default function AboutApp() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const stats = [
    {
      number: isEn ? '10,000+' : '১০,০০০+',
      label: isEn ? 'Active Job Notices' : 'সকল চাকরির সার্কুলার',
      desc: isEn ? 'Govt, Bank, NGO & Private' : 'সরকারি, ব্যাংক, প্রাইভেট ও এনজিও',
      bg: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
      border: '1px solid rgba(37, 99, 235, 0.15)',
      color: '#2563eb'
    },
    {
      number: isEn ? 'Instant' : 'তাত্ক্ষণিক',
      label: isEn ? 'Push Alerts' : 'পুশ নোটিফিকেশন',
      desc: isEn ? 'Never miss a deadline' : 'সার্কুলার প্রকাশের সাথে সাথে নোটিশ',
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.15)',
      color: '#d97706'
    },
    {
      number: isEn ? 'Live MCQ' : 'লাইভ পরীক্ষা',
      label: isEn ? 'Exam Room' : 'এমসিকিউ মডেল টেস্ট',
      desc: isEn ? 'BCS, NTRCA & Primary' : 'লাইভ বিষয়ভিত্তিক পরীক্ষা ও রেজাল্ট',
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.15)',
      color: '#059669'
    },
    {
      number: isEn ? '1-Click' : '১-ক্লিক',
      label: isEn ? 'HD Offline Save' : 'এইচডি ইমেজ ডাউনলোড',
      desc: isEn ? 'Original circular images' : 'অফিসিয়াল সার্কুলার পিকচার ফ্রিতে সেভ',
      bg: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(109, 40, 217, 0.03) 100%)',
      border: '1px solid rgba(124, 58, 237, 0.15)',
      color: '#7c3aed'
    }
  ];

  const features = [
    {
      title: isEn ? 'Instant Real-time Alerts' : 'তাত্ক্ষণিক নোটিফিকেশন অ্যালার্ট',
      desc: isEn 
        ? 'Get immediate notifications as soon as new job circulars, admit cards, or exam dates are published.'
        : 'সরকারি, ব্যাংক বা অন্যান্য প্রতিষ্ঠানে নতুন চাকরির নিয়োগ বিজ্ঞপ্তি প্রকাশের সাথেই নোটিফিকেশন পান।'
    },
    {
      title: isEn ? 'Live MCQ Exam Platform' : 'লাইভ এমসিকিউ ও মডেল টেস্ট',
      desc: isEn 
        ? 'Participate in live competitive exams for BCS, NTRCA, Bank & Primary Teacher Recruitment with instant scoring.'
        : 'বিসিএস, ব্যাংক, শিক্ষক নিবন্ধন ও প্রাইমারি নিয়োগ পরীক্ষার জন্য লাইভ পরীক্ষা দিন ও মেরিট পজিশন দেখুন।'
    },
    {
      title: isEn ? 'Previous Questions Hub' : 'বিগত বছরের প্রশ্ন ও উত্তর ব্যাংক',
      desc: isEn 
        ? 'Access thousands of previous job exam questions, detailed solutions, and subject-wise study archives.'
        : 'বিভিন্ন সরকারি ও প্রাইভেট নিয়োগ পরীক্ষার বিগত বছরের প্রশ্ন ও ব্যাখ্যাসহ সমাধান খুব সহজেই পড়ুন।'
    },
    {
      title: isEn ? 'Smart Category Filters' : 'ক্যাটাগরি ভিত্তিক সহজ সার্চ',
      desc: isEn 
        ? 'Filter jobs effortlessly by Government, Bank, Autonomous, Ministry, Railway, or Private sectors.'
        : 'বিসিএস, ব্যাংক, প্রাইমারি, প্রতিরক্ষা বা প্রাইভেট সেক্টরের চাকরির সার্কুলার আলাদাভাবে বেছে নিন।'
    },
    {
      title: isEn ? 'Offline Bookmark & Save' : 'বুকমার্ক ও অফলাইন পঠন',
      desc: isEn 
        ? 'Save your favorite circulars and questions to read offline without any internet connection.'
        : 'পছন্দের চাকরি বা প্রশ্নপত্র বুকমার্ক করে রাখুন এবং পরবর্তীতে ইন্টারনেট ছাড়াই যেকোনো সময় দেখুন।'
    },
    {
      title: isEn ? 'High Definition Image Download' : 'অফিসিয়াল সার্কুলার ইমেজ ডাউনলোড',
      desc: isEn 
        ? 'Download full high-resolution official job notices directly to your phone gallery in 1-click.'
        : 'অফিসিয়াল নিয়োগ বিজ্ঞপ্তির স্পষ্ট মূল সার্কুলার ছবি এক ক্লিকে ফোনে ডাউনলোড ও জুমিং করে দেখার সুবিধা।'
    },
    {
      title: isEn ? 'Verified & Secure Source' : '১০০% যাচাইকৃত ও নির্ভরযোগ্য তথ্য',
      desc: isEn 
        ? 'All circulars are aggregated directly from official government gazettes, press releases, and newspapers.'
        : 'সকল চাকরির সার্কুলার অফিশিয়াল পত্রিকা, সরকারি ওয়েবসাইট ও বিশ্বস্ত সোর্স থেকে নিয়ে নিয়মিত আপডেট করা হয়।'
    },
    {
      title: isEn ? 'Admit Card & Result Alerts' : 'পরীক্ষার প্রবেশপত্র ও ফলাফল অ্যালার্ট',
      desc: isEn 
        ? 'Track exam schedules, seat plans, admit card download links, and final recruitment results.'
        : 'চাকরির পরীক্ষার তারিখ, সিট প্ল্যান, প্রবেশপত্র ডাউনলোড এবং চূড়ান্ত ফলাফলের আপডেট সবার আগে পান।'
    }
  ];

  const benefits = [
    {
      title: isEn ? 'Save Precious Time' : 'আপনার মূল্যবান সময় বাঁচায়',
      desc: isEn 
        ? 'No need to visit dozens of websites daily. Get all Bangladesh job updates in a single, fast mobile application.'
        : 'প্রতিদিন শত শত সরকারি ও বেসরকারি ওয়েবসাইট ঘুরে তথ্য খোঁজার দরকার নেই। এক অ্যাপেই পান সকল সার্কুলার।'
    },
    {
      title: isEn ? 'Boost Exam Preparation' : 'চাকরি প্রস্তুতির সেরা সঙ্গী',
      desc: isEn 
        ? 'Practice live MCQ model tests, review past question solutions, and track your progress with realistic exam timers.'
        : 'বিগত বছরের প্রশ্ন সমাধান ও নিয়মিত লাইভ এমসিকিউ মডেল টেস্টের মাধ্যমে প্রস্তুতিকে আরও মজবুত করুন।'
    },
    {
      title: isEn ? 'Clean & Eye-Friendly UI' : 'সহজ, আধুনিক ও আই-ফ্রেন্ডলি ডিজাইন',
      desc: isEn 
        ? 'Designed with soft background colors, smooth animations, and eye-soothing Dark Mode for comfortable reading.'
        : 'চোখের আরামদায়ক ডার্ক মোড এবং পরিচ্ছন্ন বাংলা ফন্ট দিয়ে তৈরি, যা ব্যবহারে দেয় প্রিমিয়াম অনুভূতি।'
    }
  ];

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
      {/* Page Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{isEn ? 'About Live Circular' : 'অ্যাপ সম্পর্কিত ও বৈশিষ্ট্য'}</span>
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Hero Branding Banner Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          borderRadius: '24px',
          padding: '24px 20px',
          textAlign: 'center',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Subtle Decorative Background Glow */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.1)',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }} />

          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', margin: 0, letterSpacing: '-0.3px' }}>
            Live Circular
          </h2>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--white)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '30px', marginTop: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {isEn ? 'Version 1.0.9' : 'ভার্সন ১.০.৯'}
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '16px', fontWeight: 600 }}>
            {isEn 
              ? "Bangladesh's most trusted recruitment portal providing real-time government, bank, NGO, and private job circulars, admit cards, exam schedules, and live MCQ preparation."
              : "বাংলাদেশের ১ নম্বর বিশ্বস্ত চাকরি সংক্রান্ত পোর্টাল। এখানে সকল সরকারি চাকরি, ব্যাংকের চাকরি, প্রাইভেট সেক্টরের সার্কুলার, পরীক্ষার প্রবেশপত্র, ফলাফল এবং লাইভ এমসিকিউ প্রস্তুতি নিন এক অ্যাপে।"}
          </p>
        </div>

        {/* Live Impact & Capability Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {stats.map((item, idx) => {
            return (
              <div key={idx} style={{
                background: item.bg,
                border: item.border,
                borderRadius: '18px',
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.2 }}>
                    {item.number}
                  </h3>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: item.color, margin: '2px 0 0 0' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)', margin: '2px 0 0 0', fontWeight: 500 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Heading: Key Features */}
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px', opacity: 0.7 }}></div>
            <span>{isEn ? 'All Features & Capabilities' : 'অ্যাপের সকল ফিচার ও সুবিধাসমূহ'}</span>
          </h3>
        </div>

        {/* Features List Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {features.map((f, i) => {
            return (
              <div key={i} className="card" style={{
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '18px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                    {f.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Heading: Why Choose Us / User Benefits */}
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '16px', background: '#10b981', borderRadius: '2px' }}></div>
            <span>{isEn ? 'Key Benefits for Job Seekers' : 'চাকরিপ্রার্থীদের জন্য কেন এটি সেরা?'}</span>
          </h3>
        </div>

        {/* Benefits Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {benefits.map((b, idx) => (
            <div key={idx} style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.02) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              borderRadius: '18px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  {b.title}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Official Disclaimer & Source Trust Component */}
        <Disclaimer />

      </div>
      <BottomNav />
    </div>
  );
}
