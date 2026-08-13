/**
 * Security Utility Module
 * Provides XSS prevention, input sanitization, and safe output encoding
 */

/**
 * Sanitizes input strings by escaping dangerous HTML characters to prevent XSS attacks.
 * @param {string} str - Raw input string
 * @returns {string} Safe HTML-escaped string
 */
export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return str || '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Strips script tags, inline javascript handlers, and malicious protocol links.
 * @param {string} str - Input text or HTML payload
 * @returns {string} Sanitized string safe for rendering
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str || '';

  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"]?)(.*?)\1/gi, '')
    .replace(/javascript\s*:/gi, '');
};

/**
 * Validates and formats URLs to ensure they use allowed secure protocols (http, https, mailto, tel).
 * @param {string} url - Target link URL
 * @returns {string} Validated URL or fallback '#'
 */
export const sanitizeURL = (url) => {
  if (typeof url !== 'string' || !url.trim()) return '#';
  const clean = url.trim();

  // Allow standard safe protocols only
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(clean)) {
    return clean;
  }
  return '#';
};

/**
 * Masks mobile numbers for privacy compliance (e.g., 01712345678 -> 0171****678)
 * @param {string} phone - Raw mobile number
 * @returns {string} Masked mobile string
 */
export const maskPhoneNumber = (phone) => {
  if (typeof phone !== 'string' || phone.length < 7) return phone || '';
  const start = phone.slice(0, 4);
  const end = phone.slice(-3);
  return `${start}****${end}`;
};
