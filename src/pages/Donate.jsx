import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HandHeart, CheckCircle2, Copy, Donate as DonateIcon, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { hideNativeBannerAd } from '../utils/admobUtils';
import { getDonationConfig, recordDonationSubmission } from '../utils/donationService';
import bkashLogo from '../assets/logos/bkash.png';
import nagadLogo from '../assets/logos/nagad.png';
import '../styles/donate.css';

export default function Donate() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  // 100% guarantee that banner ads NEVER show on Donate page
  useEffect(() => {
    hideNativeBannerAd();
  }, []);

  // ═══ Payment Gateway Account Numbers (Dynamic from Admin) ═══
  const [bkashNumber, setBkashNumber] = useState('01750-123456');
  const [nagadNumber, setNagadNumber] = useState('01850-654321');

  // Load gateway numbers dynamically from Supabase config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getDonationConfig();
        if (config?.bkashNumber) setBkashNumber(config.bkashNumber);
        if (config?.nagadNumber) setNagadNumber(config.nagadNumber);
      } catch (err) {
        console.warn('Failed to load dynamic donation config:', err);
      }
    };
    loadConfig();
  }, []);

  // ═══ STEP 1: Choose Amount State ═══
  const [step, setStep] = useState(1); // 1: Choose Amount, 2: Payment (bKash/Nagad), 3: Thank You
  const [isMonthly, setIsMonthly] = useState(false);
  const [amount, setAmount] = useState('250');
  const currency = 'BDT'; // Always BDT as requested
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // ═══ STEP 2: Payment Method & TrxID State ═══
  const [selectedGateway, setSelectedGateway] = useState('bkash'); // 'bkash' | 'nagad'
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Presets in BDT
  const presets = ['100', '250', '500', '1000'];

  const handleCopyNumber = (num) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  const handleProceedToPayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert(isEn ? 'Please enter a valid donation amount' : 'সঠিক অনুদানের পরিমাণ লিখুন');
      return;
    }
    if (!agreeTerms) {
      alert(isEn ? 'Please agree to the terms to proceed' : 'অনুগ্রহ করে শর্তাবলীতে সম্মতি দিন');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmDonation = async () => {
    if (!transactionId.trim()) {
      alert(isEn ? 'Please enter your Transaction ID (TrxID)' : 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) লিখুন');
      return;
    }
    setIsSubmitting(true);

    try {
      await recordDonationSubmission({
        donorName: donorName.trim(),
        senderPhone: senderNumber.trim(),
        trxId: transactionId.trim().toUpperCase(),
        amount,
        currency,
        gateway: selectedGateway,
        isMonthly,
        isAnonymous
      });
    } catch (err) {
      console.warn('recordDonationSubmission err:', err);
    } finally {
      setIsSubmitting(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setStep(1);
    setTransactionId('');
    setSenderNumber('');
  };

  return (
    <div className="pixel-donate-page animate-fade-in">
      {/* ═══ Fixed White Modern Header (Matching Saved Jobs Page Header) ═══ */}
      <div className="page-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} 
          className="back-btn"
          aria-label="Back"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, flex: 1 }}>
          <DonateIcon size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Support Us' : 'অনুদান ও সহায়তা'}</span>
        </h1>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STEP 1: Choose Amount (Pixel-Perfect match with modern architecture)
          ══════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <>
          {/* Hero: Proper icon badge + Support related title (very small refined size) */}
          <div className="pixel-donate-hero animate-slide-up">
            <div className="pixel-icon-badge">
              <DonateIcon size={22} color="var(--donate-green)" />
            </div>
            <h1 className="pixel-impact-title">
              Support Live Circular
            </h1>
            <p className="pixel-impact-sub">
              Help us keep job notices & exam tools free and accessible for all
            </p>
          </div>

          {/* White Main Card Container */}
          <div className="pixel-donate-card-wrapper">
            <div className="pixel-donate-card animate-slide-up">
              <h2 className="pixel-card-title">Choose amount</h2>

              {/* Frequency Toggle: One-Time / Monthly 💚 */}
              <div className="pixel-frequency-row">
                <span 
                  className={`pixel-frequency-label ${!isMonthly ? 'active' : ''}`}
                  onClick={() => setIsMonthly(false)}
                >
                  One-Time
                </span>

                <div 
                  className={`pixel-toggle-switch ${isMonthly ? 'monthly-active' : ''}`}
                  onClick={() => setIsMonthly(prev => !prev)}
                >
                  <div className="pixel-toggle-circle" />
                </div>

                <span 
                  className={`pixel-frequency-label ${isMonthly ? 'active' : ''}`}
                  onClick={() => setIsMonthly(true)}
                >
                  Monthly 💚
                </span>
              </div>

              {/* Amount Input with Static BDT Badge */}
              <div className="pixel-amount-input-box">
                <input
                  type="number"
                  className="pixel-amount-number-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
                <div className="pixel-currency-badge-static">
                  <span>BDT</span>
                </div>
              </div>

              {/* 4 Preset Amount Chips Row */}
              <div className="pixel-presets-row">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`pixel-preset-chip ${amount === preset ? 'active' : ''}`}
                    onClick={() => setAmount(preset)}
                  >
                    <span className="dollar-sign">৳</span>
                    <span>{preset}</span>
                  </button>
                ))}
              </div>

              {/* Donate Anonymously Checkbox */}
              <div 
                className="pixel-checkbox-row"
                onClick={() => setIsAnonymous(prev => !prev)}
              >
                <div className={`pixel-checkbox-box ${isAnonymous ? 'checked' : ''}`}>
                  {isAnonymous && <span style={{ color: 'white', fontSize: '11px', fontWeight: 900 }}>✓</span>}
                </div>
                <span className="pixel-checkbox-label">Donate Anonymously</span>
              </div>

              {/* Donor Name Input (Shown when not anonymous) */}
              {!isAnonymous && (
                <input
                  type="text"
                  className="pixel-donor-name-input"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name"
                />
              )}

              {/* Proper Donation Terms Notice (Always English as requested) */}
              <div className="pixel-terms-box">
                <div className="pixel-terms-header">
                  <FileText size={12} color="var(--donate-green)" />
                  <span>Terms & Conditions</span>
                </div>
                <div className="pixel-terms-item">
                  <span className="pixel-terms-bullet">•</span>
                  <span>Voluntary contribution to keep circulars, servers & prep tools free for all.</span>
                </div>
                <div className="pixel-terms-item">
                  <span className="pixel-terms-bullet">•</span>
                  <span>Contributions are non-refundable and do not guarantee any employment.</span>
                </div>
              </div>

              {/* Agree To Terms Checkbox (Only first word capitalized as requested) */}
              <div 
                className="pixel-checkbox-row"
                onClick={() => setAgreeTerms(prev => !prev)}
              >
                <div className={`pixel-checkbox-box ${agreeTerms ? 'checked' : ''}`}>
                  {agreeTerms && <span style={{ color: 'white', fontSize: '11px', fontWeight: 900 }}>✓</span>}
                </div>
                <span className="pixel-checkbox-label">
                  I agree to the terms & conditions
                </span>
              </div>

              {/* Action Button */}
              <button 
                type="button" 
                className="pixel-donate-btn"
                onClick={handleProceedToPayment}
              >
                DONATE
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 2: Payment Method (bKash & Nagad) + Transaction ID (TrxID)
          (Removed "Payment Gateway" badge & "Complete Your Donation" text as instructed)
          ══════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="pixel-donate-card-wrapper" style={{ marginTop: '8px' }}>
          <div className="pixel-donate-card animate-slide-up">
            {/* Compact Donation Summary Bar */}
            <div className="pixel-step2-summary-card">
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--donate-text-muted)', textTransform: 'uppercase' }}>
                  Total Support
                </div>
                <div className="pixel-step2-summary-amount">
                  ৳ {amount} BDT
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>
                  {isMonthly ? 'Monthly 💚' : 'One-Time'}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--donate-text-muted)' }}>
                  {isAnonymous ? (isEn ? 'Anonymous Donor' : 'বেনামী শুভাকাঙ্ক্ষী') : (donorName.trim() || (isEn ? 'Donor' : 'দাতা'))}
                </div>
              </div>
            </div>

            {/* Payment Methods: bKash & Nagad (Real official logos) */}
            <div className="pixel-payment-options-grid">
              {/* bKash Card */}
              <div 
                className={`pixel-payment-option-card bkash ${selectedGateway === 'bkash' ? 'selected' : ''}`}
                onClick={() => setSelectedGateway('bkash')}
              >
                <div className="pixel-payment-badge-row">
                  <div className="pixel-gateway-badge">
                    <div className="pixel-gateway-logo-wrap">
                      <img src={bkashLogo} alt="bKash" className="pixel-gateway-logo-img" />
                    </div>
                    <span>bKash Personal</span>
                  </div>
                  <div className={`pixel-checkbox-box ${selectedGateway === 'bkash' ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                    {selectedGateway === 'bkash' && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                  </div>
                </div>

                {selectedGateway === 'bkash' && (
                  <div className="pixel-number-copy-box">
                    <span>Number: <strong>{bkashNumber}</strong></span>
                    <button 
                      type="button" 
                      className="pixel-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopyNumber(bkashNumber); }}
                    >
                      {copiedNumber ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>

              {/* Nagad Card */}
              <div 
                className={`pixel-payment-option-card nagad ${selectedGateway === 'nagad' ? 'selected' : ''}`}
                onClick={() => setSelectedGateway('nagad')}
              >
                <div className="pixel-payment-badge-row">
                  <div className="pixel-gateway-badge">
                    <div className="pixel-gateway-logo-wrap">
                      <img src={nagadLogo} alt="Nagad" className="pixel-gateway-logo-img" />
                    </div>
                    <span>Nagad Personal</span>
                  </div>
                  <div className={`pixel-checkbox-box ${selectedGateway === 'nagad' ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                    {selectedGateway === 'nagad' && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                  </div>
                </div>

                {selectedGateway === 'nagad' && (
                  <div className="pixel-number-copy-box">
                    <span>Number: <strong>{nagadNumber}</strong></span>
                    <button 
                      type="button" 
                      className="pixel-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopyNumber(nagadNumber); }}
                    >
                      {copiedNumber ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Instruction box */}
            <div className="pixel-instruction-box">
              ১. আপনার {selectedGateway === 'bkash' ? 'বিকাশ' : 'নগদ'} থেকে উপরে দেওয়া নম্বরে <strong>Send Money</strong> করুন।<br />
              ২. সফল ট্রানজেকশনের পর <strong>Transaction ID (TrxID)</strong> কপি করে নিচের বক্সে লিখুন।
            </div>

            {/* Mobile Number Input */}
            <div style={{ marginBottom: '10px' }}>
              <label className="pixel-input-label">
                Mobile Number
              </label>
              <input
                type="text"
                className="pixel-donor-name-input"
                style={{ marginBottom: '0' }}
                placeholder=""
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
              />
            </div>

            {/* Transaction ID Input */}
            <div style={{ marginBottom: '14px' }}>
              <label className="pixel-input-label">
                Transaction ID (TrxID) *
              </label>
              <input
                type="text"
                className="pixel-donor-name-input"
                style={{ marginBottom: '0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800 }}
                placeholder="e.g. 9KA71BX29"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            {/* Send Donation Button */}
            <button
              type="button"
              className="pixel-donate-btn"
              onClick={handleConfirmDonation}
              disabled={isSubmitting}
              style={isSubmitting ? { opacity: 0.8, pointerEvents: 'none' } : {}}
            >
              {isSubmitting ? 'VERIFYING...' : 'SEND DONATION'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 3: Celebratory "Thank You" Screen
          ══════════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="pixel-donate-card-wrapper" style={{ marginTop: '12px' }}>
          <div className="pixel-donate-card pixel-thankyou-screen animate-slide-up">
            <div className="pixel-thankyou-circle animate-scale-up">
              ✓
            </div>

            <h1 className="pixel-thankyou-heading">
              Thank You! 💚
            </h1>
            <p className="pixel-thankyou-sub">
              Together, We're Making A Difference.<br />
              Your support keeps Live Circular growing for everyone.
            </p>

            {/* Receipt Summary Card */}
            <div className="pixel-receipt-summary">
              <div className="pixel-receipt-line">
                <span>Donor</span>
                <strong style={{ color: 'var(--donate-text-primary)' }}>
                  {isAnonymous ? (isEn ? 'Anonymous Donor' : 'বেনামী শুভাকাঙ্ক্ষী') : (donorName.trim() || (isEn ? 'Donor' : 'দাতা'))}
                </strong>
              </div>
              <div className="pixel-receipt-line">
                <span>Payment Method</span>
                <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{selectedGateway}</span>
              </div>
              <div className="pixel-receipt-line">
                <span>Transaction ID</span>
                <strong style={{ letterSpacing: '0.5px', color: 'var(--donate-green)' }}>{transactionId.toUpperCase()}</strong>
              </div>
              <div className="pixel-receipt-line">
                <span>Frequency</span>
                <span>{isMonthly ? 'Monthly 💚' : 'One-Time'}</span>
              </div>
              <div className="pixel-receipt-line total">
                <span>Total Support</span>
                <span>৳ {amount} BDT</span>
              </div>
            </div>

            <button
              type="button"
              className="pixel-donate-btn"
              onClick={() => navigate('/home')}
              style={{ marginBottom: '8px' }}
            >
              BACK TO HOME
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--donate-text-muted)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              Make Another Donation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
