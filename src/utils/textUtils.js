/**
 * Text and HTML sanitization utilities for Job Circular
 */

/**
 * Strips all HTML tags and decodes common HTML entities from a string.
 * Ensures clean plain-text output for card titles, organization names, and descriptions.
 * 
 * @param {string|object} input 
 * @returns {string}
 */
export function stripHtmlTags(input) {
  if (!input) return '';
  
  let str = input;
  if (typeof str === 'object') {
    str = str.bn || str.en || str.title || str.name || str.text || '';
  }
  if (typeof str !== 'string') {
    str = String(str || '');
  }

  // Replace block endings and line breaks with spaces so words do not concatenate
  let cleaned = str
    .replace(/<br\s*[\/]?>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|tr|th|td|blockquote)>/gi, ' ')
    .replace(/<[^>]*>/g, '');

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&#60;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#62;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return '';
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return '';
      }
    });

  // Collapse multiple whitespaces and newlines
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes rich text HTML for descriptions to prevent invisible text
 * caused by dark-mode copied styles (e.g. color: rgb(255, 255, 255)).
 * 
 * @param {string} html 
 * @returns {string}
 */
export function sanitizeRichHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/color:\s*(#fff(fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/gi, 'color: inherit');
}
