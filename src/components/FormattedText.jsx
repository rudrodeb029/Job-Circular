import React from 'react';

export default function FormattedText({
  text = '',
  className = '',
  style = {},
  lineClamp = false,
  showMore = false
}) {
  if (!text) return null;

  // Check if text has HTML tags
  const hasHtml = /<[a-z][\s\S]*>/i.test(text);

  const containerStyle = {
    fontSize: '14px',
    lineHeight: 1.8,
    fontWeight: 400,
    color: 'var(--text-primary)',
    fontFamily: '"Noto Sans Bengali", "Hind Siliguri", "Inter", sans-serif',
    letterSpacing: 0,
    wordBreak: 'break-word',
    ...(lineClamp && !showMore ? {
      display: '-webkit-box',
      WebkitLineClamp: typeof lineClamp === 'number' ? lineClamp : 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    } : {}),
    ...style
  };

  if (hasHtml) {
    return (
      <div
        className={`formatted-text-content ${className}`}
        style={containerStyle}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  // Plain text: preserve newlines and double spacing
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className={`formatted-text-content ${className}`} style={containerStyle}>
      {paragraphs.map((para, idx) => (
        <p key={idx} style={{ margin: idx === paragraphs.length - 1 ? 0 : '0 0 10px 0' }}>
          {para.split('\n').map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {line}
              {lIdx < para.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
