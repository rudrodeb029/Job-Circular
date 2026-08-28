import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import Disclaimer from '../components/Disclaimer';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('policy'); // 'policy' | 'disclaimer_bn' | 'disclaimer_en'

  return (
    <div className="page" style={{ background: 'var(--bg-secondary)', paddingBottom: '100px' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: '15px', fontWeight: 800 }}>Privacy Policy & Legal Disclaimer</h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          background: 'var(--card-bg, #ffffff)',
          padding: '6px',
          borderRadius: '16px',
          border: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setActiveTab('policy')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'policy' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'policy' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '11.5px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔒 Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('disclaimer_bn')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'disclaimer_bn' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'disclaimer_bn' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '11.5px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🇧🇩 বাংলা ডিসক্লেইমার
          </button>
          <button
            onClick={() => setActiveTab('disclaimer_en')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'disclaimer_en' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'disclaimer_en' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '11.5px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🇬🇧 Legal Disclaimer
          </button>
        </div>

        {/* TAB 1: Privacy Policy */}
        {activeTab === 'policy' && (
          <div className="card animate-fade-in" style={{ marginBottom: '20px', borderRadius: '24px', borderTop: '4px solid var(--primary)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
                <Shield size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Privacy & Data Security</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Last updated: August 2026</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  1. Information We Collect
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  We collect information you provide directly to us when creating a profile, including your name, mobile number, educational qualification, district location, and target job categories. We also collect activity data such as saved job circulars, applied jobs, and feedback messages you send to our support team.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  2. Data Synchronization & Storage
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Your profile and activity data are synchronized with our secure cloud database (Supabase & Cloudflare) to ensure your information is backed up and can be restored if you reinstall the app. We also use high-performance local caching to store job data on your device for instant offline access.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  3. Push Notifications & Push Token
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  We use OneSignal and Firebase Cloud Messaging (FCM) to send real-time alerts about new job circulars, exam dates, and results. These services process anonymous, unique device push tokens to route alerts to your device. You can opt-out of push notifications at any time via App Settings or system notification settings.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  4. Third-Party Services
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Our application utilizes trusted third-party services to deliver reliable app functionality:
                </p>
                <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li><strong>Supabase & Cloudflare Edge CDN:</strong> For database hosting, REST API proxying, and caching.</li>
                  <li><strong>OneSignal & FCM:</strong> For real-time push notifications.</li>
                  <li><strong>Cloudinary:</strong> For optional profile avatar and job circular image uploads.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  5. Non-Affiliation Disclaimer
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Live Circular is an independent job notices aggregator. We gather public job notices from official government websites (such as bangladesh.gov.bd, bpsc.gov.bd, mopa.gov.bd, teletalk.com.bd). <strong>Live Circular does NOT represent any government entity.</strong>
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  6. Children's Privacy
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Our app is designed for job seekers aged 13 and older. We do not knowingly collect personal data from children under 13 years of age.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  7. Data Retention & Deletion Rights
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  You have the right to request deletion of your profile data. You can clear local app data via <em>Settings &rarr; Clear Cache</em>, or email your data deletion request to <strong>rudrodeb029@gmail.com</strong>.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  8. Contact Support
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  If you have any questions or concerns regarding this Privacy Policy, please contact our support team at <strong>rudrodeb029@gmail.com</strong> or via the Contact Us section in the app.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: Bengali Detailed Disclaimer */}
        {activeTab === 'disclaimer_bn' && (
          <div className="card animate-fade-in" style={{ padding: '20px', borderRadius: '24px', borderTop: '4px solid #f59e0b', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              🇧🇩 সতর্কবার্তা ও আইনি দাবিত্যাগ (Disclaimer & Legal Notice)
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '20px' }}>
              গুগল প্লে স্টোর পলিসি ও কপিরাইট আইন মেনে গঠিত
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12.5px', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '14px', padding: '12px 14px', color: '#873800', fontWeight: 700 }}>
                📢 <strong>জরুরি সতর্কীকরণ:</strong> লাইভ সার্কুলার কোনো সরকারি সংস্থা বা কর্তৃপক্ষের প্রতিনিধিত্ব করে না।
              </div>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ১. তথ্যের উৎস ও নির্ভরযোগ্যতা:
                </h3>
                <p style={{ margin: 0 }}>
                  এই অ্যাপ্লিকেশনে প্রদর্শিত সকল চাকরির বিজ্ঞপ্তি (Job Circular), পরীক্ষার সময়সূচী, ফলাফল এবং বিগত সালের পরীক্ষার প্রশ্ন-সমাধান সম্পূর্ণ শিক্ষামূলক ও তথ্য প্রদানের উদ্দেশ্যে প্রকাশ করা হয়েছে। এসব তথ্য বিভিন্ন সরকারি ও বেসরকারি প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট, জাতীয় দৈনিক পত্রিকা এবং ইন্টারনেট মাধ্যম থেকে অত্যন্ত সতর্কতার সাথে সংগ্রহ করা হয়।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ২. কোনো সরকারি বা প্রাতিষ্ঠানিক সম্পৃক্ততা নেই (No Government Affiliation):
                </h3>
                <p style={{ margin: 0 }}>
                  স্পষ্টভাবে জানানো যাচ্ছে যে, এই অ্যাপ্লিকেশনটি বাংলাদেশ সরকার, কোনো সরকারি অধিদপ্তর, মন্ত্রণালয়, স্বায়ত্তশাসিত সংস্থা কিংবা কোনো নির্দিষ্ট চাকরি নিয়োগকারী বোর্ডের (যেমন: BPSC, NTRCA, বা কোনো ব্যাংক) অফিসিয়াল অ্যাপ নয়। আমরা কোনো সরকারি সেবা প্রদান করি না এবং সরকারের কোনো প্রতিনিধিত্ব করি না। এটি চাকরিপ্রার্থীদের সুবিধার্থে তৈরি একটি স্বাধীন ও ব্যক্তিগত তথ্যসেবা প্ল্যাটফর্ম।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ৩. কপিরাইট এবং মেধা সম্পত্তি (Copyright & Intellectual Property):
                </h3>
                <p style={{ margin: 0 }}>
                  বিগত সালের পরীক্ষার মূল প্রশ্নপত্রের অধিকার সম্পূর্ণভাবে সংশ্লিষ্ট পরীক্ষা নিয়ন্ত্রণ কর্তৃপক্ষের। আমরা কোনো বাণিজ্যিক প্রকাশনী বা গাইড বইয়ের কপিরাইটযুক্ত কন্টেন্ট (যেমন: হুবহু স্ক্যান করা পাতা বা তাদের তৈরি করা এক্সক্লুসিভ সমাধান) অনুমোদন করি না। অ্যাপে থাকা সমাধানগুলো আমাদের নিজস্ব টিম দ্বারা পরীক্ষামূলকভাবে তৈরি বা উন্মুক্ত সোর্স থেকে সংগৃহীত।
                </p>
                <p style={{ marginTop: '6px' }}>
                  এরপরও যদি কোনো কন্টেন্ট, ছবি বা তথ্য আপনার কপিরাইট বা মেধা সম্পত্তি লঙ্ঘন করে বলে আপনি মনে করেন, তবে আমাদের সাথে যোগাযোগ করার অনুরোধ রইল। অভিযোগ প্রমাণিত হওয়া মাত্র আমরা ২৪ থেকে ৪৮ ঘণ্টার মধ্যে উক্ত কন্টেন্ট অ্যাপ থেকে অপসারণ করব।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ৪. আবেদন ও তথ্যের সত্যতা যাচাই:
                </h3>
                <p style={{ margin: 0 }}>
                  চাকরির বিজ্ঞপ্তিতে আবেদন করার পূর্বে চাকরিপ্রার্থীদের অবশ্যই সংশ্লিষ্ট প্রতিষ্ঠানের অফিসিয়াল সার্কুলার, আবেদনের শেষ তারিখ এবং নিয়মাবলী নিজ দায়িত্বে ভালোভাবে যাচাই করে নেওয়ার জন্য বিশেষভাবে অনুরোধ করা হলো। কোনো বিজ্ঞপ্তির ভুল তথ্য, টাইপিং মিস্টেক বা অনিচ্ছাকৃত ত্রুটির কারণে ব্যবহারকারীর কোনো আর্থিক, মানসিক বা অন্য কোনো ক্ষতি হলে এই অ্যাপ কর্তৃপক্ষ কোনোভাবেই দায়ী থাকবে না।
                </p>
              </section>

              <section style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ৫. যোগাযোগ (Contact Information):
                </h3>
                <p style={{ margin: 0 }}>
                  যেকোনো প্রশ্ন, অভিযোগ বা কন্টেন্ট অপসারণের অনুরোধের জন্য সরাসরি আমাদের ইমেইল করুন:
                  <br />
                  📩 ইমেইল: <a href="mailto:rudrodeb029@gmail.com" style={{ color: 'var(--primary)', fontWeight: 800 }}>rudrodeb029@gmail.com</a>
                </p>
              </section>
            </div>
          </div>
        )}

        {/* TAB 3: English Detailed Disclaimer */}
        {activeTab === 'disclaimer_en' && (
          <div className="card animate-fade-in" style={{ padding: '20px', borderRadius: '24px', borderTop: '4px solid #2563eb', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              🇬🇧 Legal Disclaimer & Terms of Use
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '20px' }}>
              Fully compliant with Google Play Policy & Intellectual Property Guidelines
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12.5px', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '12px 14px', color: '#1e40af', fontWeight: 700 }}>
                📢 <strong>Mandatory Notice:</strong> Live Circular is an independent platform and does NOT represent any government entity.
              </div>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  1. Source of Information:
                </h3>
                <p style={{ margin: 0 }}>
                  All job circulars, exam schedules, results, and previous year's exam question papers published in this application are collected from various official organization websites, national daily newspapers, and publicly available online sources. This content is provided solely for educational and informational purposes.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  2. Non-Affiliation with Government (No Government Representation):
                </h3>
                <p style={{ margin: 0 }}>
                  Please note that this application is NOT affiliated with, authorized, endorsed, or sponsored by the Government of Bangladesh, any government ministry, directorate, autonomous body, or any recruitment board (e.g., BPSC, NTRCA, etc.). We do not represent any government entity, nor do we facilitate government services. This is an independent, privately owned platform built to help job seekers access publicly available information easily.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  3. Copyright & Fair Use Notice:
                </h3>
                <p style={{ margin: 0 }}>
                  The copyright of the original exam questions belongs entirely to the respective examination conducting authorities. We do not publish copyrighted materials, scanned pages, or exclusive solutions from commercial guidebooks. The answers and explanations provided within the app are independently compiled by our team or adapted from open-source references.
                </p>
                <p style={{ marginTop: '6px' }}>
                  If you are a copyright owner and believe that any content in this app infringes upon your intellectual property rights, please contact us with valid proof. We will address your concern and remove the violating content within 24-48 hours.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  4. Verification and Liability Limitation:
                </h3>
                <p style={{ margin: 0 }}>
                  Users are strongly advised to verify the authenticity of any job circular, application deadline, and eligibility criteria from the official website of the respective hiring organization before applying or making any financial transactions. The developers of this app shall not be held liable for any inaccuracies, typographical errors, or any direct or indirect loss resulting from the use of the information provided in this app.
                </p>
              </section>

              <section style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  5. Contact Us:
                </h3>
                <p style={{ margin: 0 }}>
                  For any queries, copyright notices, or takedown requests, please contact us at:
                  <br />
                  📩 Email: <a href="mailto:rudrodeb029@gmail.com" style={{ color: 'var(--primary)', fontWeight: 800 }}>rudrodeb029@gmail.com</a>
                </p>
              </section>
            </div>
          </div>
        )}

        {/* Shared Disclaimer Footer */}
        <Disclaimer />
      </div>
      <BottomNav />
    </div>
  );
}
