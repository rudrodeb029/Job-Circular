import React from 'react';

export const JobCardSkeleton = () => (
  <div className="skeleton-card" style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '12px', marginBottom: '12px' }}>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div className="skeleton skeleton-circle" style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#e0e0e0' }}></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ height: '16px', width: '80%', backgroundColor: '#e0e0e0', marginBottom: '8px', borderRadius: '4px' }}></div>
        <div className="skeleton skeleton-text" style={{ height: '14px', width: '50%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
      </div>
    </div>
    <div className="skeleton skeleton-text" style={{ height: '12px', width: '30%', backgroundColor: '#e0e0e0', marginTop: '16px', borderRadius: '4px' }}></div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="skeleton-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', marginBottom: '12px' }}>
    <div className="skeleton skeleton-circle" style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#e0e0e0', marginRight: '16px' }}></div>
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ height: '16px', width: '60%', backgroundColor: '#e0e0e0', marginBottom: '6px', borderRadius: '4px' }}></div>
      <div className="skeleton skeleton-text" style={{ height: '12px', width: '30%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
    </div>
  </div>
);

export const HomeSkeleton = () => (
  <div style={{ padding: '16px' }}>
    <div className="skeleton skeleton-text" style={{ height: '24px', width: '40%', backgroundColor: '#e0e0e0', marginBottom: '16px', borderRadius: '4px' }}></div>
    <div className="skeleton skeleton-card" style={{ height: '48px', width: '100%', backgroundColor: '#e0e0e0', borderRadius: '8px', marginBottom: '24px' }}></div>
    <div className="skeleton skeleton-card" style={{ height: '100px', width: '100%', backgroundColor: '#e0e0e0', borderRadius: '12px', marginBottom: '24px' }}></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
      <div className="skeleton skeleton-card" style={{ height: '60px', borderRadius: '8px', backgroundColor: '#e0e0e0' }}></div>
      <div className="skeleton skeleton-card" style={{ height: '60px', borderRadius: '8px', backgroundColor: '#e0e0e0' }}></div>
    </div>
    <div style={{ marginBottom: '16px' }}>
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  </div>
);

const SkeletonLoader = {
  JobCardSkeleton,
  CategorySkeleton,
  HomeSkeleton
};

export default SkeletonLoader;
