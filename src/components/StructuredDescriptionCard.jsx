import React, { useMemo } from 'react';
import { Menu, Briefcase, GraduationCap, MapPin, DollarSign, Info, Star, FileText, CheckCircle } from './Icons';

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
    // Check if line looks like a header (e.g. ends with ':' or starts with '#' or matches section keywords)
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
        background: isDark ? 'var(--card-bg, #1e293b)' : '#ffffff',
        borderRadius: '20px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1.5px solid rgba(219, 234, 254, 0.8)',
        boxShadow: isDark
          ? '0 8px 24px -4px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px -4px rgba(37, 99, 235, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        marginBottom: 'var(--space-lg)',
        overflow: 'hidden'
      }}
    >
      {/* ── Top Header Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(219, 234, 254, 0.7)',
          background: isDark
            ? 'linear-gradient(90deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.6) 100%)'
            : 'linear-gradient(90deg, #f8faff 0%, #ffffff 100%)'
        }}
      >
        {/* Blue Square with Hamburger/Menu Icon */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Menu size={16} color="#ffffff" />
        </div>

        {/* Card Title */}
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: isDark ? '#f8fafc' : '#0f172a',
            margin: 0,
            letterSpacing: '-0.2px'
          }}
        >
          {displayTitle}
        </h3>

        {/* Three Slanted Accent Bars on the Right (///) matching reference image */}
        <svg
          width="26"
          height="14"
          viewBox="0 0 30 16"
          fill="none"
          style={{ marginLeft: 'auto', flexShrink: 0 }}
        >
          <path d="M4 16L9 0H13L8 16H4Z" fill="#1d4ed8" />
          <path d="M12 16L17 0H21L16 16H12Z" fill="#2563eb" />
          <path d="M20 16L25 0H29L24 16H20Z" fill="#60a5fa" />
        </svg>
      </div>

      {/* ── Content Body ── */}
      <div style={{ padding: '16px' }}>
        {sections.map((section, sIdx) => {
          const isFirstIntro = sIdx === 0 && !section.heading;
          const isLastSection = sIdx === sections.length - 1;

          return (
            <div key={sIdx}>
              {/* If it's a first intro section without a heading, render with Info Circle badge */}
              {isFirstIntro ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      boxShadow: '0 2px 5px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <Info size={14} color="#ffffff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {section.items.map((item, iIdx) => (
                      <p
                        key={iIdx}
                        style={{
                          fontSize: '11px',
                          lineHeight: 1.7,
                          color: isDark ? '#cbd5e1' : '#334155',
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
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span
                              style={{
                                fontSize: '11px',
                                lineHeight: 1.65,
                                color: isDark ? '#cbd5e1' : '#334155',
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
                            color: isDark ? '#cbd5e1' : '#475569',
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
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(219, 234, 254, 0.7)',
                    margin: '12px 0'
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
