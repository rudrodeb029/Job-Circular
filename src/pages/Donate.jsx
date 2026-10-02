import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { hideNativeBannerAd } from '../utils/admobUtils';
import '../styles/donate.css';

export default function Donate() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  // 100% guarantee that banner ads NEVER show on Donate page
  useEffect(() => {
    hideNativeBannerAd();
  }, []);

  // ═══ STEP 1: Choose Amount State ═══
  const [step, setStep] = useState(1); // 1: Choose Amount, 2: Payment (bKash/Nagad), 3: Thank You
  const [isMonthly, setIsMonthly] = useState(false);
  const [amount, setAmount] = useState('550');
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'BDT'
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState(state.user?.name || 'Adam Cooper Jr.');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // ═══ STEP 2: Payment Method & TrxID State ═══
  const [selectedGateway, setSelectedGateway] = useState('bkash'); // 'bkash' | 'nagad'
  const [senderNumber, setSenderNumber] = useState(state.user?.phone || '');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ═══ Payment Gateway Account Numbers ═══
  const BKASH_NUMBER = '01750-123456';
  const NAGAD_NUMBER = '01850-654321';

  // Presets depending on currency
  const presetsUSD = ['10', '25', '50', '100'];
  const presetsBDT = ['100', '250', '500', '1000'];
  const currentPresets = currency === 'USD' ? presetsUSD : presetsBDT;

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

  const handleConfirmDonation = () => {
    if (!transactionId.trim()) {
      alert(isEn ? 'Please enter your Transaction ID (TrxID)' : 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) লিখুন');
      return;
    }
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const handleReset = () => {
    setStep(1);
    setTransactionId('');
  };

  return (
    <div className="pixel-donate-page animate-fade-in">
      {/* ═══ Top Minimal Header ═══ */}
      {/* Notice: Red-marked sections (Hope Rise logo and hamburger icon) are completely removed as instructed */}
      <div className="pixel-donate-top-nav">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} 
          className="pixel-back-btn"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ width: '40px' }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STEP 1: Choose Amount (Pixel-Perfect match to uploaded screenshot)
          ══════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <>
          {/* Hero Titles */}
          <div className="pixel-donate-hero animate-slide-up">
            <div className="pixel-impact-badge">
              Our Impact
            </div>
            <h1 className="pixel-impact-title">
              Together, We're Making A Difference
            </h1>
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

              {/* Amount Input with Currency Dropdown */}
              <div className="pixel-amount-input-box">
                <input
                  type="number"
                  className="pixel-amount-number-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
                <div 
                  className="pixel-currency-selector"
                  onClick={() => setCurrency(prev => prev === 'USD' ? 'BDT' : 'USD')}
                >
                  <span>{currency}</span>
                  <span style={{ fontSize: '10px' }}>▼</span>
                </div>
              </div>

              {/* 4 Preset Amount Chips Row */}
              <div className="pixel-presets-row">
                {currentPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`pixel-preset-chip ${amount === preset ? 'active' : ''}`}
                    onClick={() => setAmount(preset)}
                  >
                    <span className="dollar-sign">{currency === 'USD' ? '$' : '৳'}</span>
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
                  {isAnonymous && <span style={{ color: 'white', fontSize: '13px', fontWeight: 900 }}>✓</span>}
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

              {/* Agree To Terms Checkbox */}
              <div 
                className="pixel-checkbox-row"
                onClick={() => setAgreeTerms(prev => !prev)}
              >
                <div className={`pixel-checkbox-box ${agreeTerms ? 'checked' : ''}`}>
                  {agreeTerms && <span style={{ color: 'white', fontSize: '13px', fontWeight: 900 }}>✓</span>}
                </div>
                <span className="pixel-checkbox-label">I Agree To The Terms</span>
              </div>

              {/* Big Vibrant Green Action Button */}
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
          ══════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <>
          <div className="pixel-donate-hero animate-slide-up">
            <div className="pixel-impact-badge">
              Payment Gateway
            </div>
            <h1 className="pixel-impact-title">
              Complete Your Donation
            </h1>
          </div>

          <div className="pixel-donate-card-wrapper">
            <div className="pixel-donate-card animate-slide-up">
              {/* Summary Pill */}
              <div style={{
                background: 'var(--donate-input-bg)',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                border: '1px solid var(--donate-border)'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--donate-text-muted)', textTransform: 'uppercase' }}>
                    Donation Amount
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--donate-green)' }}>
                    {currency === 'USD' ? '$' : '৳'} {amount} {currency}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>
                    {isMonthly ? 'Monthly 💚' : 'One-Time'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--donate-text-muted)' }}>
                    {isAnonymous ? 'Anonymous' : donorName}
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 12px 0' }}>
                Select Payment Method
              </h3>

              {/* Payment Methods: bKash & Nagad */}
              <div className="pixel-payment-options-grid">
                {/* bKash Card */}
                <div 
                  className={`pixel-payment-option-card bkash ${selectedGateway === 'bkash' ? 'selected' : ''}`}
                  onClick={() => setSelectedGateway('bkash')}
                >
                  <div className="pixel-payment-badge-row">
                    <div className="pixel-gateway-badge">
                      <span className="pixel-gateway-logo-pill bkash">bKash</span>
                      <span>bKash Personal / Send Money</span>
                    </div>
                    <div className={`pixel-checkbox-box ${selectedGateway === 'bkash' ? 'checked' : ''}`} style={{ width: '18px', height: '18px' }}>
                      {selectedGateway === 'bkash' && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                    </div>
                  </div>

                  {selectedGateway === 'bkash' && (
                    <div className="pixel-number-copy-box">
                      <span>bKash Number: <strong>{BKASH_NUMBER}</strong></span>
                      <button 
                        type="button" 
                        className="pixel-copy-btn"
                        onClick={(e) => { e.stopPropagation(); handleCopyNumber(BKASH_NUMBER); }}
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
                      <span className="pixel-gateway-logo-pill nagad">Nagad</span>
                      <span>Nagad Personal / Send Money</span>
                    </div>
                    <div className={`pixel-checkbox-box ${selectedGateway === 'nagad' ? 'checked' : ''}`} style={{ width: '18px', height: '18px' }}>
                      {selectedGateway === 'nagad' && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                    </div>
                  </div>

                  {selectedGateway === 'nagad' && (
                    <div className="pixel-number-copy-box">
                      <span>Nagad Number: <strong>{NAGAD_NUMBER}</strong></span>
                      <button 
                        type="button" 
                        className="pixel-copy-btn"
                        onClick={(e) => { e.stopPropagation(); handleCopyNumber(NAGAD_NUMBER); }}
                      >
                        {copiedNumber ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div style={{
                fontSize: '12px',
                color: 'var(--donate-text-muted)',
                lineHeight: 1.5,
                background: 'var(--donate-input-bg)',
                padding: '10px 14px',
                borderRadius: '12px',
                marginBottom: '16px',
                borderLeft: '3px solid var(--donate-green)'
              }}>
                ১. আপনার {selectedGateway === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাপ থেকে উপরে দেওয়া নম্বরে <strong>Send Money</strong> করুন।<br />
                ২. সফল ট্রানজেকশনের পর <strong>Transaction ID (TrxID)</strong> কপি করে নিচের বক্সে লিখুন।
              </div>

              {/* Sender Phone Number Input */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Sender Mobile Number (প্রেরকের নম্বর)
                </label>
                <input
                  type="text"
                  className="pixel-donor-name-input"
                  style={{ marginBottom: '0' }}
                  placeholder="01XXXXXXXXX"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                />
              </div>

              {/* Transaction ID Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Transaction ID (TrxID) *
                </label>
                <input
                  type="text"
                  className="pixel-donor-name-input"
                  style={{ marginBottom: '0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}
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

              <div style={{ textAlign: 'center', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: 'var(--donate-text-muted)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Change Amount
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 3: Celebratory "Thank You" Screen
          ══════════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="pixel-donate-card-wrapper" style={{ marginTop: '20px' }}>
          <div className="pixel-donate-card pixel-thankyou-screen animate-slide-up">
            <div className="pixel-thankyou-circle animate-scale-up">
              ✓
            </div>

            <h1 className="pixel-thankyou-heading">
              Thank You! 💚
            </h1>
            <p className="pixel-thankyou-sub">
              Together, We're Making A Difference.<br />
              Your contribution has been received for review.
            </p>

            {/* Receipt Summary Card */}
            <div className="pixel-receipt-summary">
              <div className="pixel-receipt-line">
                <span>Donor</span>
                <strong style={{ color: 'var(--donate-text-primary)' }}>{isAnonymous ? 'Anonymous Donor' : donorName}</strong>
              </div>
              <div className="pixel-receipt-line">
                <span>Method</span>
                <span style={{ textTransform: 'capitalize' }}>{selectedGateway}</span>
              </div>
              <div className="pixel-receipt-line">
                <span>Transaction ID</span>
                <strong style={{ letterSpacing: '0.5px', color: 'var(--donate-green)' }}>{transactionId.toUpperCase()}</strong>
              </div>
              <div className="pixel-receipt-line">
                <span>Frequency</span>
                <span>{isMonthly ? 'Monthly' : 'One-Time'}</span>
              </div>
              <div className="pixel-receipt-line total">
                <span>Total Amount</span>
                <span>{currency === 'USD' ? '$' : '৳'} {amount} {currency}</span>
              </div>
            </div>

            <button
              type="button"
              className="pixel-donate-btn"
              onClick={() => navigate('/home')}
              style={{ marginBottom: '12px' }}
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
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '8px'
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
