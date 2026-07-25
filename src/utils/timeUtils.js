/**
 * Formats a timestamp into a relative "time ago" string.
 * Supports both English and Bengali.
 */
export const formatTimeAgo = (timestamp, isEn = false) => {
  if (!timestamp) return isEn ? 'Recently' : 'কিছুক্ষণ আগে';

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return isEn ? 'Recently' : 'কিছুক্ষণ আগে';

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  // Future or just now
  if (seconds < 60) {
    return isEn ? 'Just now' : 'এইমাত্র';
  }

  const intervals = [
    { label: isEn ? 'year' : 'বছর', labelPlural: isEn ? 'years' : 'বছর', seconds: 31536000 },
    { label: isEn ? 'month' : 'মাস', labelPlural: isEn ? 'months' : 'মাস', seconds: 2592000 },
    { label: isEn ? 'day' : 'দিন', labelPlural: isEn ? 'days' : 'দিন', seconds: 86400 },
    { label: isEn ? 'hour' : 'ঘণ্টা', labelPlural: isEn ? 'hours' : 'ঘণ্টা', seconds: 3600 },
    { label: isEn ? 'minute' : 'মিনিট', labelPlural: isEn ? 'minutes' : 'মিনিট', seconds: 60 }
  ];

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      const label = count === 1 ? interval.label : interval.labelPlural;

      if (isEn) {
        return `${count} ${label} ago`;
      } else {
        return `${toBengaliNumber(count)} ${label} আগে`;
      }
    }
  }

  return isEn ? 'Recently' : 'কিছুক্ষণ আগে';
};

const toBengaliNumber = (num) => {
  const engNum = String(num);
  const bengaliDigits = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};
