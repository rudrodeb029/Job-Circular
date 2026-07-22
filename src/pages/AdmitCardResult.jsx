import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileText } from '../components/Icons';
import TabBar from '../components/TabBar';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import { admitCards } from '../data/notifications';
import { useAppContext } from '../context/AppContext';

export default function AdmitCardResult() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  const [activeTab, setActiveTab] = useState('admit_card');

  const tabs = useMemo(() => [
    { id: 'admit_card', label: isEn ? 'Exam Date' : 'পরীক্ষার তারিখ' },
    { id: 'result', label: isEn ? 'Result' : 'ফলাফল' }
  ], [isEn]);

  const filteredItems = admitCards.filter(item => item.type === activeTab);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>{isEn ? 'Admit Card & Result' : 'প্রবেশপত্র ও ফলাফল'}</h1>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {filteredItems.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredItems.map(item => (
              <div key={item.id} className="admit-item">
                <h4 className="admit-item-title">{item.examName}</h4>
                <p className="admit-item-status">{item.status}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-xs)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.date}</span>
                  <a
                    href={item.downloadLink}
                    target="_blank"
                    rel="noreferrer"
                    className="admit-item-action"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {item.type === 'admit_card' ? (
                      <>{isEn ? 'Download' : 'ডাউনলোড'} <Download size={14} /></>
                    ) : (
                      <>{isEn ? 'View Result' : 'ফলাফল দেখুন'} <Eye size={14} /></>
                    )}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={activeTab === 'admit_card' ? (isEn ? 'No Exam Dates Available' : 'কোনো পরীক্ষার তারিখ পাওয়া যায়নি') : (isEn ? 'No Results Available' : 'কোনো ফলাফল পাওয়া যায়নি')}
            description={isEn ? 'Check back later for new exam notices and results.' : 'নতুন পরীক্ষার নোটিশ এবং ফলাফলের জন্য পরবর্তীতে চেক করুন।'}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
