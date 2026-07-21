import React from 'react';

export default function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--primary-lightest)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          <Icon size={40} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
