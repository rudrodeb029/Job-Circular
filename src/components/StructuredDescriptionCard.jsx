import React, { useMemo } from 'react';
import { Menu, Briefcase, GraduationCap, MapPin, DollarSign, Info, Star, FileText } from './Icons';

/**
 * Keywords map to determine appropriate icon for a section heading
 */
const SECTION_ICONS = [
  {
    keywords: ['প্রধান দায়িত্ব', 'দায়িত্বসমূহ', 'কাজের দায়িত্ব', 'দায়িত্ব ও কর্তব্য', 'কর্তব্য', 'দায়িত্ব', 'responsibilities', 'duties', 'key responsibilities'],
    getIcon: (color = '#2563eb') => <Briefcase size={16} color={color} />
  },
  {
    keywords: ['শিক্ষাগত যোগ্যতা', 'শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা', 'যোগ্যতা ও অভিজ্ঞতা', 'অভিজ্ঞতা', 'শিক্ষাগত', 'যোগ্যতা', 'education', 'qualification', 'qualifications', 'experience', 'eligibility'],
    getIcon: (color = '#2563eb') => <GraduationCap size={17} color={color} />
  },
  {
    keywords: ['কর্মস্থল', 'কাজের স্থান', 'কর্মক্ষেত্র', 'লোকেশন', 'পদস্থান', 'location', 'work location', 'workplace', 'job location'],
    getIcon: (color = '#2563eb') => <MapPin size={16} color={color} />
  },
  {
    keywords: ['বেতন', 'বেতন স্কেল', 'বেতনক্রম', 'বেতন ও ভাতা', 'পারিশ্রমিক', 'salary', 'remuneration', 'compensation', 'pay scale'],
    getIcon: (color = '#2563eb') => <DollarSign size={16} color={color} />
  },
  {
    keywords: ['সুযোগ-সুবিধা', 'সুবিধা', 'অন্যান্য সুবিধা', 'সুবিধাসমূহ', 'benefits', 'perks', 'facilities'],
    getIcon: (color = '#2563eb') => <Star size={16} color={color} />
  },
  {
    keywords: ['নির্দেশনা', 'পরীক্ষার নির্দেশনা', 'সাধারণ নির্দেশনাবলী', 'আবেদন প্রক্রিয়া', 'আবেদনের নিয়ম', 'নিয়মাবলী', 'instructions', 'how to apply', 'guidelines', 'rules'],
    getIcon: (color = '#2563eb') => <FileText size={16} color={color} />
  }
];

function resolveSectionIcon(headingText = '', color = '#2563eb') {
  if (!headingText) return <Info size={16} color={color} />;
  const lower = headingText.toLowerCase();
  for (const item of SECTION_ICONS) {
    if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return item.getIcon(color);
    }
  }
  return <Info size={16} color={color} />;
}

/**
 * Robust HTML / Plain Text parser that extracts structured sections
 */
function parseStructuredSections(rawContent) {
  if (!rawContent) return [];
  const text = String(rawContent).trim();
  if (!text) return [];

  const hasHtml = /<[a-z][\s\S]*>/i.test(text);

  if (hasHtml && typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const sections = [];
    let current = { heading: null, items: [] };

    const pushCurrent = () => {
      if (current.items.length > 0 || current.heading) {
        sections.push(current);
      }
    };

    const processNode = (node) => {
      if (!node) return;
      const tag = node.tagName ? node.tagName.toUpperCase() : '';

      // Check for headings (H1-H6 or a <p> containing only <strong>/<b>)
      if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tag)) {
        const head = node.textContent.trim();
        if (head) {
          pushCurrent();
          current = { heading: head, items: [] };
        }
        return;
      }

      if (tag === 'P') {
        const inner = node.innerHTML.trim();
        // Check if paragraph is purely a bold header like <p><strong>দায়িত্বসমূহ:</strong></p>
        if (/^<(strong|b)[^>]*>([^<]+)<\/(strong|b)>:?$/i.test(inner)) {
          const head = node.textContent.replace(/:$/, '').trim();
          if (head && head.length < 90) {
            pushCurrent();
            current = { heading: head, items: [] };
            return;
          }
        }

        const pText = node.textContent.trim();
        if (pText) {
          current.items.push({ type: 'paragraph', text: pText });
        }
        return;
      }

      if (['UL', 'OL'].includes(tag)) {
        node.querySelectorAll('li').forEach(li => {
          const liText = li.textContent.trim();
          if (liText) {
            current.items.push({ type: 'listItem', text: liText });
          }
        });
        return;
      }

      if (['DIV', 'SECTION', 'ARTICLE', 'MAIN'].includes(tag)) {
        Array.from(node.childNodes).forEach(processNode);
        return;
      }

      if (node.nodeType === 3) {
        // Text node
        const nodeText = node.textContent.trim();
        if (nodeText) {
          current.items.push({ type: 'paragraph', text: nodeText });
        }
      }
    };

    Array.from(doc.body.childNodes).forEach(processNode);
    pushCurrent();

    if (sections.length > 0) return sections;
  }

  // Fallback / Plain Text parser
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const sections = [];
  let current = { heading: null, items: [] };

  const pushCurrent = () => {
    if (current.items.length > 0 || current.heading) {
      sections.push(current);
    }
  };

  for (const line of lines) {
    const isBullet = /^[•\-\*✓✔\d+\.]\s+/.test(line);
    const isHeaderLine = !isBullet && (
      /^#+\s+/.test(line) ||
      (line.endsWith(':') && line.length < 70) ||
      SECTION_ICONS.some(s => s.keywords.some(k => line.toLowerCase().includes(k.toLowerCase()) && line.length < 60))
    );

    if (isHeaderLine) {
      pushCurrent();
      const cleanHead = line.replace(/^#+\s*/, '').replace(/:$/, '').trim();
      current = { heading: cleanHead, items: [] };
    } else if (isBullet) {
      const cleanItem = line.replace(/^[•\-\*✓✔\d+\.]\s+/, '').trim();
      current.items.push({ type: 'listItem', text: cleanItem });
    } else {
      current.items.push({ type: 'paragraph', text: line });
    }
  }

  pushCurrent();
  return sections;
}

export default function StructuredDescriptionCard({
  description,
  title = 'চাকরির বিবরণ',
  titleEn = 'Job Description',
  language = 'bn',
  theme = 'light'
}) {
  const isDark = theme === 'dark';
  const isEn = language === 'en';
  const displayTitle = isEn ? titleEn : title;

  const sections = useMemo(() => parseStructuredSections(description), [description]);

  if (!description || !sections || sections.length === 0) return null;

  return (
    <div
      style={{
        position: 'relative',
        background: isDark ? 'var(--card-bg, #1e293b)' : '#ffffff',
        borderRadius: '20px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1.5px solid #dbeafe',
        boxShadow: isDark
          ? '0 8px 24px -4px rgba(0, 0, 0, 0.4)'
          : '0 4px 20px -2px rgba(37, 99, 235, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        marginBottom: 'var(--space-lg)',
        overflow: 'hidden'
      }}
    >
      {/* ── Bottom-Right Fluid Wave Ramp (Pixel-Perfect from Reference Design) ── */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '260px',
          height: '80px',
          pointerEvents: 'none',
          zIndex: 1
        }}
        viewBox="0 0 260 80"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Layer 1: Outer soft lighter blue curve */}
        <path
          d="M0 80 C80 80 150 54 260 22 L260 80 Z"
          fill="url(#descRampLayer1)"
          opacity={isDark ? 0.35 : 0.65}
        />
        {/* Layer 2: Inner gradient blue curve */}
        <path
          d="M60 80 C130 79 180 50 260 26 L260 80 Z"
          fill="url(#descRampLayer2)"
          opacity={isDark ? 0.45 : 0.85}
        />
        <defs>
          <linearGradient id="descRampLayer1" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="60%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
          <linearGradient id="descRampLayer2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Top Header Bar ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px 12px 16px'
        }}
      >
        {/* Blue Square with Hamburger/Menu Icon - reduced size */}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '5px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 5px rgba(37, 99, 235, 0.2)',
            marginRight: '8px'
          }}
        >
          <Menu size={12} color="#ffffff" />
        </div>

        {/* Card Title */}
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: isDark ? '#f8fafc' : '#0f172a',
            margin: 0,
            letterSpacing: '-0.2px',
            whiteSpace: 'nowrap'
          }}
        >
          {displayTitle}
        </h3>

        {/* Connecting horizontal gray line matching reference design */}
        <div
          style={{
            flex: 1,
            height: '1px',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            margin: '0 12px'
          }}
        />

        {/* 3 Diagonal Slashes on the Right (///) matching reference design */}
        <svg
          width="24"
          height="15"
          viewBox="0 0 28 18"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path d="M4 18L10 0H14L8 18H4Z" fill="#2563eb" />
          <path d="M11 18L17 0H21L15 18H11Z" fill="#2563eb" />
          <path d="M18 18L24 0H28L22 18H18Z" fill="#2563eb" />
        </svg>
      </div>

      {/* ── Content Body ── */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 16px 16px 16px' }}>
        {sections.map((section, sIdx) => {
          const isFirstIntro = sIdx === 0 && !section.heading;
          const isLastSection = sIdx === sections.length - 1;

          return (
            <div key={sIdx}>
              {/* If it's a first intro section without a heading, render with plain Info icon (no bg color) */}
              {isFirstIntro ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingTop: '2px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      color: '#2563eb'
                    }}
                  >
                    <Info size={15} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {section.items.map((item, iIdx) => (
                      <p
                        key={iIdx}
                        style={{
                          fontSize: '11px',
                          lineHeight: 1.65,
                          color: isDark ? '#cbd5e1' : '#1e293b',
                          margin: iIdx === section.items.length - 1 ? 0 : '0 0 6px 0',
                          fontFamily: '"Noto Sans Bengali", "Hind Siliguri", "Inter", sans-serif',
                          fontWeight: 500
                        }}
                      >
                        {item.text}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                /* Headed section */
                <div>
                  {section.heading && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: '#2563eb'
                        }}
                      >
                        {resolveSectionIcon(section.heading, '#2563eb')}
                      </div>
                      <h4
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: isDark ? '#f1f5f9' : '#0f172a',
                          margin: 0,
                          letterSpacing: '-0.1px'
                        }}
                      >
                        {section.heading}
                      </h4>
                    </div>
                  )}

                  {/* Section items */}
                  <div style={{ paddingLeft: section.heading ? '24px' : '0' }}>
                    {section.items.map((item, iIdx) => {
                      if (item.type === 'listItem') {
                        return (
                          <div
                            key={iIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              marginBottom: iIdx === section.items.length - 1 ? 0 : '6px'
                            }}
                          >
                            {/* Blue Checkmark */}
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 16 16"
                              fill="none"
                              style={{ flexShrink: 0, marginTop: '3px' }}
                            >
                              <path
                                d="M3 8.5L6.5 12L13 4"
                                stroke="#2563eb"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span
                              style={{
                                fontSize: '11px',
                                lineHeight: 1.65,
                                color: isDark ? '#cbd5e1' : '#1e293b',
                                fontFamily: '"Noto Sans Bengali", "Hind Siliguri", "Inter", sans-serif',
                                fontWeight: 500
                              }}
                            >
                              {item.text}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <p
                          key={iIdx}
                          style={{
                            fontSize: '11px',
                            lineHeight: 1.65,
                            color: isDark ? '#cbd5e1' : '#1e293b',
                            margin: iIdx === section.items.length - 1 ? 0 : '0 0 6px 0',
                            fontFamily: '"Noto Sans Bengali", "Hind Siliguri", "Inter", sans-serif',
                            fontWeight: 500
                          }}
                        >
                          {item.text}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Divider line between sections */}
              {!isLastSection && (
                <div
                  style={{
                    height: '1px',
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                    margin: '14px 0'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
