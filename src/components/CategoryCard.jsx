import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from './Icons';

const categoryGradientMap = {
  gov: { bg: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', shadow: 'rgba(29, 78, 216, 0.3)', badgeBg: '#eff6ff', badgeColor: '#1d4ed8' },
  bank: { bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', shadow: 'rgba(5, 150, 105, 0.3)', badgeBg: '#ecfdf5', badgeColor: '#047857' },
  ngo: { bg: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', shadow: 'rgba(234, 88, 12, 0.3)', badgeBg: '#fff7ed', badgeColor: '#c2410c' },
  private: { bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', shadow: 'rgba(124, 58, 237, 0.3)', badgeBg: '#f5f3ff', badgeColor: '#6d28d9' },
  teaching: { bg: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)', shadow: 'rgba(219, 39, 119, 0.3)', badgeBg: '#fdf2f8', badgeColor: '#be185d' },
  defense: { bg: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', shadow: 'rgba(220, 38, 38, 0.3)', badgeBg: '#fef2f2', badgeColor: '#b91c1c' },
  healthcare: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.3)', badgeBg: '#f0fdfa', badgeColor: '#0f766e' },
  health: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.3)', badgeBg: '#f0fdfa', badgeColor: '#0f766e' },
  it: { bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', shadow: 'rgba(79, 70, 229, 0.3)', badgeBg: '#eef2ff', badgeColor: '#4338ca' },
  engineering: { bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', shadow: 'rgba(217, 119, 6, 0.3)', badgeBg: '#fffbeb', badgeColor: '#b45309' },
  parttime: { bg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', shadow: 'rgba(2, 132, 199, 0.3)', badgeBg: '#f0f9ff', badgeColor: '#0369a1' }
};

export default function CategoryCard({ category }) {
  const navigate = useNavigate();
  const theme = categoryGradientMap[category.id] || categoryGradientMap.gov;

  return (
    <div
      onClick={() => navigate(`/search?category=${category.id}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px',
        marginBottom: '12px',
        borderRadius: '18px',
        background: 'var(--white)',
        border: '1px solid var(--border-light)',
        boxShadow: '0 4px 18px -2px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
    >
      {/* Glossy 3D Gradient Icon Badge Tile */}
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: theme.bg,
          boxShadow: `0 6px 16px ${theme.shadow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          flexShrink: 0
        }}
      >
        {category.icon}
      </div>

      {/* Category Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontSize: '15px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}>
          {category.name}
        </h4>
        <span style={{
          display: 'inline-block',
          fontSize: '10.5px',
          fontWeight: 700,
          background: theme.badgeBg,
          color: theme.badgeColor,
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          {category.jobCount} circulars
        </span>
      </div>

      {/* Chevron Button Tile */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        flexShrink: 0
      }}>
        <ChevronRight size={18} />
      </div>
    </div>
  );
}
