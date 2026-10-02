import React, { useState, useEffect, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { getDonations, deleteDonation, getDonationConfig, saveDonationConfig } from '../../utils/donationService';
import { formatTimeAgo } from '../../utils/timeUtils';
import bkashLogo from '../../assets/logos/bkash.png';
import nagadLogo from '../../assets/logos/nagad.png';

export default function ManageDonations() {
  const { state: adminState, dispatch } = useAdminContext() || { state: {} };
  const rawActivities = adminState?.activities || [];

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('all'); // 'all' | 'bkash' | 'nagad'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | '7days' | '30days'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'one-time' | 'monthly'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [copiedId, setCopiedId] = useState(null);

  // Gateway Settings Modal / Drawer
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configData, setConfigData] = useState({ bkashNumber: '', nagadNumber: '' });
  const [configSaving, setConfigSaving] = useState(false);

  // Load Donations and Gateway Config
  const loadData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      // Load Config
      const conf = await getDonationConfig(force);
      if (conf) {
        setConfigData({
          bkashNumber: conf.bkashNumber || '01750-123456',
          nagadNumber: conf.nagadNumber || '01850-654321'
        });
      }

      // Load Donations from Supabase
      const list = await getDonations(force);
      setDonations(list);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);

    const handleDonationReceived = () => {
      loadData(true);
    };
    window.addEventListener('donation_received', handleDonationReceived);
    return () => window.removeEventListener('donation_received', handleDonationReceived);
  }, []);

  // Sync reactively with adminState activities if updated in realtime
  useEffect(() => {
    const fromState = (rawActivities || [])
      .filter(item => item && (item.type === 'donation' || item.trxId || (item.action || '').toLowerCase().includes('donation')))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (fromState.length > 0) {
      setDonations(fromState);
    }
  }, [rawActivities]);

  const handleCopyTrx = (trxId, id) => {
    if (!trxId) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trxId);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation record?')) return;
    try {
      await deleteDonation(id);
      setDonations(prev => prev.filter(d => d.id !== id));
      if (dispatch) {
        dispatch({
          type: 'SET_ACTIVITIES',
          payload: (rawActivities || []).filter(a => a.id !== id)
        });
      }
    } catch (err) {
      alert('Failed to delete donation: ' + err.message);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      await saveDonationConfig(configData);
      alert('✅ Donation numbers updated successfully!');
      setShowConfigModal(false);
    } catch (err) {
      alert('❌ Failed to save donation numbers: ' + err.message);
    } finally {
      setConfigSaving(false);
    }
  };

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter(item => {
      // Gateway Filter
      if (gatewayFilter !== 'all') {
        const gw = (item.gateway || '').toLowerCase();
        if (gw !== gatewayFilter) return false;
      }

      // Frequency / Type Filter
      if (typeFilter !== 'all') {
        const isMon = Boolean(item.isMonthly);
        if (typeFilter === 'monthly' && !isMon) return false;
        if (typeFilter === 'one-time' && isMon) return false;
      }

      // Date Filter
      if (dateFilter !== 'all') {
        const itemTime = new Date(item.createdAt || 0).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          if (now - itemTime > 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === '7days') {
          if (now - itemTime > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === '30days') {
          if (now - itemTime > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (item.userName || '').toLowerCase().includes(q);
        const matchPhone = (item.senderPhone || '').toLowerCase().includes(q);
        const matchTrx = (item.trxId || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchTrx && !matchDesc) return false;
      }

      return true;
    });
  }, [donations, gatewayFilter, typeFilter, dateFilter, searchTerm]);

  // Analytics Metrics
  const stats = useMemo(() => {
    let totalBDT = 0;
    let bkashCount = 0;
    let bkashBDT = 0;
    let nagadCount = 0;
    let nagadBDT = 0;
    let monthlyCount = 0;

    donations.forEach(d => {
      const amt = parseFloat(d.amount) || 0;
      totalBDT += amt;
      const gw = (d.gateway || '').toLowerCase();
      if (gw === 'bkash') {
        bkashCount++;
        bkashBDT += amt;
      } else if (gw === 'nagad') {
        nagadCount++;
        nagadBDT += amt;
      }
      if (d.isMonthly) monthlyCount++;
    });

    return {
      totalCount: donations.length,
      totalBDT,
      bkashCount,
      bkashBDT,
      nagadCount,
      nagadBDT,
      monthlyCount
    };
  }, [donations]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / itemsPerPage));
  const currentItems = filteredDonations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredDonations.length === 0) {
      alert('No donation records found to export.');
      return;
    }
    const headers = ['ID', 'Donor Name', 'Donor Mobile', 'Transaction ID', 'Amount (BDT)', 'Gateway', 'Type', 'Date & Time'];
    const rows = filteredDonations.map(d => [
      `"${d.id}"`,
      `"${(d.userName || 'Donor').replace(/"/g, '""')}"`,
      `"${d.senderPhone || 'N/A'}"`,
      `"${(d.trxId || '').toUpperCase()}"`,
      `"${d.amount || 0}"`,
      `"${(d.gateway || 'bkash').toUpperCase()}"`,
      `"${d.isMonthly ? 'Monthly' : 'One-Time'}"`,
      `"${d.createdAt ? new Date(d.createdAt).toLocaleString() : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donations_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-donations-page animate-fade-in" style={{ padding: '16px 20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .donation-metric-card {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          padding: 16px 18px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
        }
        .donation-metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }
        .btn-green {
          padding: 9px 16px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 9px;
          font-weight: 700;
          font-size: 12.5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(5, 150, 105, 0.2);
          transition: all 0.2s;
        }
        .btn-green:hover {
          background: #047857;
          transform: translateY(-1px);
        }
        .btn-outline-admin {
          padding: 9px 15px;
          background: #ffffff;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-outline-admin:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }
        .admin-donations-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10.5px;
          padding: 12px 14px;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-donations-table td {
          padding: 13px 14px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 12.5px;
          color: #1e293b;
          vertical-align: middle;
        }
        .admin-donations-table tbody tr:hover {
          background: #fafbfc;
        }
        .copy-pill-btn {
          border: none;
          background: transparent;
          color: #2563eb;
          cursor: pointer;
          font-weight: 700;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 4px;
          transition: background 0.15s;
        }
        .copy-pill-btn:hover {
          background: #eff6ff;
        }
      `}</style>

      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>💚</span>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Donations & Financial Support
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            View real-time donor submissions, track bKash/Nagad transactions, and manage payment numbers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-outline-admin" onClick={() => loadData(true)} disabled={refreshing}>
            <span>{refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}</span>
          </button>
          <button className="btn-outline-admin" onClick={handleExportCSV}>
            <span>📥 Export CSV</span>
          </button>
          <button className="btn-green" onClick={() => setShowConfigModal(true)}>
            <span>⚙️ Edit Gateway Numbers</span>
          </button>
        </div>
      </div>

      {/* ═══ Key Metrics Grid ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {/* Total Raised */}
        <div className="donation-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Funds Raised
            </p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 800, color: '#047857' }}>
              ৳ {stats.totalBDT.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b' }}>BDT</span>
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>From {stats.totalCount} donation(s)</span>
          </div>
          <div style={{ width: '42px', height: '42px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            💰
          </div>
        </div>

        {/* bKash Total */}
        <div className="donation-metric-card" style={{ borderLeft: '4px solid #e11d48' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={bkashLogo} alt="bKash" style={{ height: '14px', objectFit: 'contain' }} />
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#9f1239', textTransform: 'uppercase' }}>
                bKash Personal
              </p>
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#be123c' }}>
              ৳ {stats.bkashBDT.toLocaleString()}
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{stats.bkashCount} contribution(s)</span>
          </div>
          <div style={{ width: '42px', height: '42px', background: '#fdf2f8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            📱
          </div>
        </div>

        {/* Nagad Total */}
        <div className="donation-metric-card" style={{ borderLeft: '4px solid #ea580c' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={nagadLogo} alt="Nagad" style={{ height: '14px', objectFit: 'contain' }} />
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
                Nagad Personal
              </p>
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#c2410c' }}>
              ৳ {stats.nagadBDT.toLocaleString()}
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{stats.nagadCount} contribution(s)</span>
          </div>
          <div style={{ width: '42px', height: '42px', background: '#fff7ed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            💸
          </div>
        </div>

        {/* Monthly Supporters */}
        <div className="donation-metric-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Monthly Supporters
            </p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 800, color: '#4338ca' }}>
              {stats.monthlyCount}
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Recurring green patrons</span>
          </div>
          <div style={{ width: '42px', height: '42px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            🌟
          </div>
        </div>
      </div>

      {/* ═══ Main Table & Filter Container ═══ */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {/* Filters Top Bar */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search donor name, phone, or TrxID..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '9px',
                fontSize: '12.5px',
                outline: 'none',
                color: '#1e293b'
              }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Gateway Filter */}
            <select
              value={gatewayFilter}
              onChange={e => { setGatewayFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#334155', background: '#fff', cursor: 'pointer' }}
            >
              <option value="all">All Gateways</option>
              <option value="bkash">bKash Only</option>
              <option value="nagad">Nagad Only</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#334155', background: '#fff', cursor: 'pointer' }}
            >
              <option value="all">All Types</option>
              <option value="one-time">One-Time Only</option>
              <option value="monthly">Monthly Supporters</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#334155', background: '#fff', cursor: 'pointer' }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            {/* Items Per Page */}
            <select
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#334155', background: '#fff', cursor: 'pointer' }}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* ═══ Data Table ═══ */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-donations-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Donor Details</th>
                <th style={{ width: '170px' }}>Donor Mobile</th>
                <th style={{ width: '210px' }}>Transaction ID (TrxID)</th>
                <th style={{ width: '140px' }}>Amount (BDT)</th>
                <th style={{ width: '130px' }}>Gateway</th>
                <th style={{ width: '120px' }}>Plan</th>
                <th style={{ width: '160px' }}>Date & Time</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, idx) => {
                const isBkash = (item.gateway || '').toLowerCase() === 'bkash';
                const isAnonymous = Boolean(item.isAnonymous);
                const donorTitle = isAnonymous ? 'Anonymous Donor' : (item.userName || 'Generous Donor');
                const dateObj = item.createdAt ? new Date(item.createdAt) : null;

                return (
                  <tr key={item.id || idx}>
                    {/* Donor Details */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isAnonymous ? '#f1f5f9' : '#ecfdf5',
                          color: isAnonymous ? '#64748b' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '14px',
                          flexShrink: 0
                        }}>
                          {isAnonymous ? '👤' : (donorTitle.charAt(0).toUpperCase() || 'D')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                            {donorTitle}
                          </div>
                          {isAnonymous && (
                            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                              (Identity Protected)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Donor Mobile */}
                    <td>
                      {item.senderPhone ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b' }}>
                          <span>📱</span>
                          <span>{item.senderPhone}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11.5px' }}>Not Provided</span>
                      )}
                    </td>

                    {/* Transaction ID */}
                    <td>
                      {item.trxId ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#15803d', fontSize: '13px', letterSpacing: '0.6px' }}>
                            {item.trxId.toUpperCase()}
                          </span>
                          <button
                            className="copy-pill-btn"
                            onClick={() => handleCopyTrx(item.trxId, item.id)}
                            title="Copy TrxID"
                          >
                            {copiedId === item.id ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11.5px' }}>N/A</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: '#ecfdf5',
                        color: '#047857',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '13px'
                      }}>
                        ৳ {item.amount || '0'} <span style={{ fontSize: '10.5px', opacity: 0.85 }}>BDT</span>
                      </span>
                    </td>

                    {/* Gateway Badge */}
                    <td>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        background: isBkash ? '#fdf2f8' : '#fff7ed',
                        border: isBkash ? '1px solid #fbcfe8' : '1px solid #fed7aa'
                      }}>
                        <img
                          src={isBkash ? bkashLogo : nagadLogo}
                          alt={isBkash ? 'bKash' : 'Nagad'}
                          style={{ height: '14px', objectFit: 'contain' }}
                        />
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: isBkash ? '#9f1239' : '#c2410c',
                          textTransform: 'uppercase'
                        }}>
                          {isBkash ? 'bKash' : 'Nagad'}
                        </span>
                      </div>
                    </td>

                    {/* Type / Plan */}
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: item.isMonthly ? '#e0e7ff' : '#f1f5f9',
                        color: item.isMonthly ? '#4338ca' : '#475569'
                      }}>
                        {item.isMonthly ? 'Monthly 💚' : 'One-Time'}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                        {dateObj ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                        title="Delete submission"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>💚</div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#475569', fontWeight: 700 }}>
                      No donation submissions recorded yet
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                      When supporters contribute via bKash or Nagad, their mobile numbers and TrxIDs will appear here automatically.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ═══ Pagination ═══ */}
        {filteredDonations.length > 0 && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: '#fafbfc' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDonations.length)} to {Math.min(currentPage * itemsPerPage, filteredDonations.length)} of {filteredDonations.length} records
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', fontSize: '11.5px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    background: currentPage === i + 1 ? '#059669' : '#fff',
                    color: currentPage === i + 1 ? '#fff' : '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', fontSize: '11.5px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Edit Gateway Numbers Modal ═══ */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⚙️</span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  Donation Gateway Account Numbers
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 18px 0', fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
              These numbers are shown directly to candidates on the <strong>Donate</strong> page with instant one-tap copy functionality.
            </p>

            <form onSubmit={handleSaveConfig}>
              {/* bKash Number */}
              <div style={{ marginBottom: '14px', background: '#fdf2f8', padding: '14px', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#9f1239', marginBottom: '6px' }}>
                  <img src={bkashLogo} alt="bKash" style={{ height: '14px' }} />
                  BKASH PERSONAL NUMBER
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01750-123456"
                  value={configData.bkashNumber}
                  onChange={e => setConfigData({ ...configData, bkashNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #f472b6',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                    background: '#ffffff',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Nagad Number */}
              <div style={{ marginBottom: '20px', background: '#fff7ed', padding: '14px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#c2410c', marginBottom: '6px' }}>
                  <img src={nagadLogo} alt="Nagad" style={{ height: '14px' }} />
                  NAGAD PERSONAL NUMBER
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01850-654321"
                  value={configData.nagadNumber}
                  onChange={e => setConfigData({ ...configData, nagadNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #fb923c',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                    background: '#ffffff',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="btn-outline-admin"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={configSaving}
                  className="btn-green"
                >
                  {configSaving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
