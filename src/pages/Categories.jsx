import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid } from '../components/Icons';
import CategoryCard from '../components/CategoryCard';
import BottomNav from '../components/BottomNav';
import { categories } from '../data/categories';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';

import ModernLoader from '../components/ModernLoader';

export default function Categories() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { state: adminState, loading: adminLoading } = useAdminContext();
  const isEn = state.language === 'en';

  const jobs = adminState.jobs || [];

  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => {
      // Check both categoryId and category field for robustness
      const count = jobs.filter(j => j.categoryId === cat.id || j.category === cat.id).length;
      return {
        ...cat,
        jobCount: count
      };
    });
  }, [jobs]);

  if (adminLoading) {
    return (
      <div className="page">
        <div className="page-header">
           <h1 style={{ fontSize: '16px' }}>{isEn ? 'Categories' : 'ক্যাটাগরি'}</h1>
        </div>
        <div style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ModernLoader size="lg" icon="📑" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutGrid size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Categories' : 'ক্যাটাগরি'}</span>
        </h1>
      </div>

      <div className="page-content" style={{ padding: '16px 16px 80px 16px' }}>
        <div>
          {categoriesWithCounts.map((cat, index) => (
            <div
              key={cat.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
