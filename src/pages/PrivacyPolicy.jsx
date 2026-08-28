import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';

export default function PrivacyPolicy() {
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
          {isEn ? 'Privacy Policy & Legal Disclaimer' : 'প্রাইভেসি পলিসি ও আইনি দাবিত্যাগ'}
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        {!isEn ? (
          /* 🇧🇩 BANGALI MODE CONTENT */
          <div className="card animate-fade-in" style={{ marginBottom: '20px', borderRadius: '24px', borderTop: '4px solid var(--primary)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
                <Shield size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>প্রাইভেসি পলিসি ও আইনি দাবিত্যাগ</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>সর্বশেষ আপডেট: আগস্ট ২০২৬</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Important Alert Notice */}
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '14px', padding: '12px 14px', color: '#873800', fontWeight: 700, fontSize: '12px', lineHeight: 1.5 }}>
                📢 <strong>জরুরি সতর্কীকরণ:</strong> লাইভ সার্কুলার কোনো সরকারি সংস্থা বা কর্তৃপক্ষের প্রতিনিধিত্ব করে না। এটি একটি স্বাধীন চাকরি তথ্যসেবা পোর্টাল।
              </div>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ১. তথ্যের উৎস ও নির্ভরযোগ্যতা (Source of Information)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  লাইভ সার্কুলার (Live Circular) অ্যাপ্লিকেশনে প্রদর্শিত সকল চাকরির বিজ্ঞপ্তি, পরীক্ষার সময়সূচী, ফলাফল এবং বিগত সালের পরীক্ষার প্রশ্ন-সমাধান সম্পূর্ণ শিক্ষামূলক ও তথ্য প্রদানের উদ্দেশ্যে প্রকাশ করা হয়েছে। এসব তথ্য বিভিন্ন সরকারি ও বেসরকারি প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট (যেমন: bangladesh.gov.bd, bpsc.gov.bd, mopa.gov.bd, teletalk.com.bd), জাতীয় দৈনিক পত্রিকা এবং ইন্টারনেট মাধ্যম থেকে অত্যন্ত সতর্কতার সাথে সংগ্রহ করা হয়।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ২. কোনো সরকারি বা প্রাতিষ্ঠানিক সম্পৃক্ততা নেই (No Government Representation)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  স্পষ্টভাবে জানানো যাচ্ছে যে, এই অ্যাপ্লিকেশনটি বাংলাদেশ সরকার, কোনো সরকারি অধিদপ্তর, মন্ত্রণালয়, স্বায়ত্তশাসিত সংস্থা কিংবা কোনো নির্দিষ্ট চাকরি নিয়োগকারী বোর্ডের (যেমন: BPSC, NTRCA, বা কোনো ব্যাংক) অফিসিয়াল অ্যাপ নয়। আমরা কোনো সরকারি সেবা প্রদান করি না এবং সরকারের কোনো প্রতিনিধিত্ব করি না। এটি চাকরিপ্রার্থীদের সুবিধার্থে তৈরি একটি স্বাধীন ও ব্যক্তিগত তথ্যসেবা প্ল্যাটফর্ম।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ৩. কপিরাইট এবং মেধা সম্পত্তি (Copyright & Intellectual Property)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  বিগত সালের পরীক্ষার মূল প্রশ্নপত্রের অধিকার সম্পূর্ণভাবে সংশ্লিষ্ট পরীক্ষা নিয়ন্ত্রণ কর্তৃপক্ষের। আমরা কোনো বাণিজ্যিক প্রকাশনী বা গাইড বইয়ের কপিরাইটযুক্ত কন্টেন্ট (যেমন: হুবহু স্ক্যান করা পাতা বা তাদের তৈরি করা এক্সক্লুসিভ সমাধান) প্রকাশ বা শেয়ার করি না। অ্যাপে থাকা সমাধানগুলো আমাদের নিজস্ব অনলাইন টিউটর ও টিম দ্বারা স্বাধীনভাবে তৈরি বা উন্মুক্ত সোর্স থেকে সংগৃহীত।
                </p>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: '8px' }}>
                  এরপরও যদি কোনো কন্টেন্ট, ছবি বা তথ্য আপনার কপিরাইট বা মেধা সম্পত্তি লঙ্ঘন করে বলে আপনি মনে করেন, তবে আমাদের সাথে ইমেইলে যোগাযোগ করার অনুরোধ রইল। অভিযোগ প্রমাণিত হওয়া মাত্র আমরা ২৪ থেকে ৪৮ ঘণ্টার মধ্যে উক্ত কন্টেন্ট অ্যাপ থেকে অপসারণ করব।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ৪. আবেদন ও তথ্যের সত্যতা যাচাই (Verification & Liability)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  চাকরির বিজ্ঞপ্তিতে আবেদন করার পূর্বে চাকরিপ্রার্থীদের অবশ্যই সংশ্লিষ্ট প্রতিষ্ঠানের অফিসিয়াল সার্কুলার, আবেদনের শেষ তারিখ এবং নিয়মাবলী নিজ দায়িত্বে ভালোভাবে যাচাই করে নেওয়ার জন্য বিশেষভাবে অনুরোধ করা হলো। কোনো বিজ্ঞপ্তির ভুল তথ্য, টাইপিং মিস্টেক বা অনিচ্ছাকৃত ত্রুটির কারণে ব্যবহারকারীর কোনো আর্থিক, মানসিক বা অন্য কোনো ক্ষতি হলে এই অ্যাপ কর্তৃপক্ষ কোনোভাবেই দায়ী থাকবে না।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ৫. সংগৃহীত তথ্য ও ডাটা নিরাপত্তা (Data Collection & Security)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  আমরা ব্যবহারকারীর নাম, ফোন নম্বর, শিক্ষাগত যোগ্যতা এবং লক্ষ্যযুক্ত ক্যাটাগরি সংরক্ষণ করি যাতে অ্যাপের অভিজ্ঞতা উন্নত করা যায়। আমাদের অ্যাপ ব্যবহারকারীর গোপনীয়তা রক্ষা করতে সুরক্ষিত ক্লাউড ডাটাবেজ (Supabase & Cloudflare Edge) ব্যবহার করে।
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ৬. পুশ নোটিফিকেশন সার্ভিস (Push Notifications)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  নতুন সার্কুলার, পরীক্ষার তারিখ ও ফলাফলের আপডেট দ্রুত পৌঁছে দিতে আমরা OneSignal এবং FCM সার্ভিস ব্যবহার করি। আপনি ফোনের সেটিংসে গিয়ে যেকোনো সময় নোটিফিকেশন বন্ধ করতে পারেন।
                </p>
              </section>

              <section style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ৭. যোগাযোগ ও কন্টেন্ট অপসারণের নিয়ম (Contact & Takedown)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                  যেকোনো প্রশ্ন, অভিযোগ বা কপিরাইট কন্টেন্ট অপসারণের অনুরোধের জন্য সরাসরি আমাদের সাথে ইমেইলে যোগাযোগ করুন:
                  <br />
                  📩 ইমেইল: <a href="mailto:rudrodeb029@gmail.com" style={{ color: 'var(--primary)', fontWeight: 800 }}>rudrodeb029@gmail.com</a>
                </p>
              </section>
            </div>
          </div>
        ) : (
          /* 🇬🇧 ENGLISH MODE CONTENT */
          <div className="card animate-fade-in" style={{ marginBottom: '20px', borderRadius: '24px', borderTop: '4px solid var(--primary)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
                <Shield size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Privacy Policy & Legal Disclaimer</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Last updated: August 2026</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Mandatory Notice Box */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '12px 14px', color: '#1e40af', fontWeight: 700, fontSize: '12px', lineHeight: 1.5 }}>
                📢 <strong>Mandatory Notice:</strong> Live Circular is an independent platform and does NOT represent any government entity.
              </div>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  1. Source of Information
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  All job circulars, exam schedules, results, and previous year's exam question papers published in this application are collected from various official organization websites (such as bangladesh.gov.bd, bpsc.gov.bd, mopa.gov.bd, teletalk.com.bd), national daily newspapers, and publicly available online sources. This content is provided solely for educational and informational purposes.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  2. Non-Affiliation with Government (No Government Representation)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Please note that this application is NOT affiliated with, authorized, endorsed, or sponsored by the Government of Bangladesh, any government ministry, directorate, autonomous body, or any recruitment board (e.g., BPSC, NTRCA, etc.). We do not represent any government entity, nor do we facilitate government services. This is an independent, privately owned platform built to help job seekers access publicly available information easily.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  3. Copyright & Fair Use Notice
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  The copyright of the original exam questions belongs entirely to the respective examination conducting authorities. We do not publish copyrighted materials, scanned pages, or exclusive solutions from commercial guidebooks. The answers and explanations provided within the app are independently compiled by our team or adapted from open-source references.
                </p>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: '8px' }}>
                  If you are a copyright owner and believe that any content in this app infringes upon your intellectual property rights, please contact us with valid proof. We will address your concern and remove the violating content within 24-48 hours.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  4. Verification and Liability Limitation
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Users are strongly advised to verify the authenticity of any job circular, application deadline, and eligibility criteria from the official website of the respective hiring organization before applying or making any financial transactions. The developers of this app shall not be held liable for any inaccuracies, typographical errors, or any direct or indirect loss resulting from the use of the information provided in this app.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  5. Data Synchronization & Security
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Your profile and activity data are synchronized with our secure cloud database (Supabase & Cloudflare) to ensure your information is backed up and can be restored if you reinstall the app.
                </p>
              </section>

              <section style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  6. Contact & Takedown Requests
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                  For any queries, copyright notices, or takedown requests, please contact us at:
                  <br />
                  📩 Email: <a href="mailto:rudrodeb029@gmail.com" style={{ color: 'var(--primary)', fontWeight: 800 }}>rudrodeb029@gmail.com</a>
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
