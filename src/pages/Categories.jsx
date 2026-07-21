import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons';
import CategoryCard from '../components/CategoryCard';
import BottomNav from '../components/BottomNav';
import { categories } from '../data/categories';

export default function Categories() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>Categories</h1>
      </div>

      <div className="page-content" style={{ padding: '16px 16px 80px 16px' }}>
        <div>
          {categories.map((cat, index) => (
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
