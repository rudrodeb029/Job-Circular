/**
 * Unified Job Icon and Category Styling Utility.
 * Resolves appropriate visual icons and gradient badges for jobs and circulars.
 */

export const categoryStyles = {
  gov: { bg: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', shadow: 'rgba(29, 78, 216, 0.35)', defaultIcon: '🏛️' },
  bank: { bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', shadow: 'rgba(5, 150, 105, 0.35)', defaultIcon: '🏦' },
  ngo: { bg: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', shadow: 'rgba(234, 88, 12, 0.35)', defaultIcon: '🤝' },
  private: { bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', shadow: 'rgba(124, 58, 237, 0.35)', defaultIcon: '🏢' },
  teaching: { bg: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)', shadow: 'rgba(219, 39, 119, 0.35)', defaultIcon: '📚' },
  defense: { bg: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', shadow: 'rgba(220, 38, 38, 0.35)', defaultIcon: '🛡️' },
  healthcare: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.35)', defaultIcon: '🏥' },
  health: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.35)', defaultIcon: '🏥' },
  it: { bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', shadow: 'rgba(79, 70, 229, 0.35)', defaultIcon: '💻' },
  engineering: { bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', shadow: 'rgba(217, 119, 6, 0.35)', defaultIcon: '⚙️' },
  parttime: { bg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', shadow: 'rgba(2, 132, 199, 0.35)', defaultIcon: '⏰' },
  women: { bg: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)', shadow: 'rgba(225, 29, 72, 0.35)', defaultIcon: '👩‍💼' }
};

export const orgIconsMap = {
  'শিক্ষা মন্ত্রণালয়': '🏛️',
  'মহিলা বিষয়ক অধিদপ্তর': '👩‍💼',
  'মহিলা ও শিশু বিষয়ক মন্ত্রণালয়': '👩‍💼',
  'সোনালী ব্যাংক লিমিটেড': '🏦',
  'বাংলাদেশ পুলিশ': '👮',
  'ব্র্যাক': '🤝',
  'গ্রামীণফোন': '📱',
  'বাংলাদেশ সেনাবাহিনী': '🛡️',
  'ইসলামী ব্যাংক': '🕌',
  'বাংলাদেশ রেলওয়ে': '🚂',
  'ডাক ও টেলিযোগাযোগ মন্ত্রণালয়': '📡',
  'স্বাস্থ্য অধিদপ্তর': '🏥',
  'বাংলাদেশ ব্যাংক': '🏛️',
  'ভিকারুননিসা নূন স্কুল এন্ড কলেজ': '🎓',
  'এলজিইডি': '🏗️',
  'বিকাশ লিমিটেড': '💸',
  'আশা': '🌱',
  'জনতা ব্যাংক': '🏦',
  'স্কয়ার হাসপাতাল': '🩺',
  'পাঠাও': '🚀',
  'রাজউক উত্তরা মডেল কলেজ': '🏫',
  'রূপালী ব্যাংক': '🏦',
  'আকিক গ্রুপ': '🏭',
  'ওয়াটারএইড বাংলাদেশ': '💧',
  'টেন মিনিট স্কুল': '✍️',
  'প্রাণ-আরএফএল গ্রুপ': '📦',
  'পপুলার ডায়াগনস্টিক সেন্টার': '🔬',
  'বেক্সিমকো ফার্মা': '💊',
  'ফাইবার অ্যাট হোম': '🌐',
  'দুর্নীতি দমন কমিশন (দুদক)': '⚖️',
  'স্বপ্ন সুপার শপ': '🛒'
};

export const getJobIconAndStyle = (job) => {
  if (!job) return { icon: '🏛️', style: categoryStyles.gov };

  // 1. If job has an explicit icon specified
  if (job.icon && typeof job.icon === 'string' && job.icon.trim()) {
    const rawCat = (job.category || job.categoryId || '').toLowerCase();
    const style = categoryStyles[rawCat] || categoryStyles.gov;
    return { icon: job.icon.trim(), style };
  }

  const org = (job.organization || '').toLowerCase();
  const orgEn = (job.organizationEn || '').toLowerCase();
  const title = (job.title || '').toLowerCase();
  const titleEn = (job.titleEn || '').toLowerCase();
  const cat = (job.category || job.categoryId || '').toLowerCase();
  const combined = `${org} ${orgEn} ${title} ${titleEn} ${cat}`;

  // 2. Exact match in orgIconsMap
  if (job.organization && orgIconsMap[job.organization]) {
    const matchedIcon = orgIconsMap[job.organization];
    return { icon: matchedIcon, style: categoryStyles[cat] || categoryStyles.gov };
  }

  // 3. Domain and keyword smart matching
  if (combined.includes('মহিলা') || combined.includes('women') || combined.includes('শিশু')) {
    return { icon: '👩‍💼', style: categoryStyles.women };
  }
  if (combined.includes('পুলিশ') || combined.includes('police')) {
    return { icon: '👮', style: categoryStyles.defense };
  }
  if (combined.includes('সেনা') || combined.includes('army') || combined.includes('সৈনিক') || combined.includes('sainik') || combined.includes('defense') || combined.includes('প্রতিরক্ষা') || combined.includes('নৌবাহিনী') || combined.includes('navy') || combined.includes('বিমান') || combined.includes('air force') || combined.includes('বিজিবি') || combined.includes('bgb') || combined.includes('আনসার') || combined.includes('কারারক্ষী')) {
    return { icon: '🛡️', style: categoryStyles.defense };
  }
  if (combined.includes('ব্যাংক') || combined.includes('bank') || combined.includes('সোনালী') || combined.includes('জনতা') || combined.includes('রূপালী') || combined.includes('অগ্রণী') || combined.includes('বাংলাদেশ ব্যাংক')) {
    return { icon: '🏦', style: categoryStyles.bank };
  }
  if (combined.includes('স্বাস্থ্য') || combined.includes('health') || combined.includes('হাসপাতাল') || combined.includes('hospital') || combined.includes('মেডিকেল') || combined.includes('medical') || combined.includes('ডাক্তার') || combined.includes('doctor') || combined.includes('নার্স') || combined.includes('nurse') || combined.includes('ফার্মা') || combined.includes('pharma') || combined.includes('ঔষধ') || combined.includes('clinic')) {
    return { icon: '🏥', style: categoryStyles.healthcare };
  }
  if (combined.includes('শিক্ষা') || combined.includes('teacher') || combined.includes('শিক্ষক') || combined.includes('স্কুল') || combined.includes('school') || combined.includes('কলেজ') || combined.includes('college') || combined.includes('বিশ্ববিদ্যালয়') || combined.includes('university') || combined.includes('মাদরাসা') || combined.includes('teaching') || combined.includes('প্রাইমারি') || combined.includes('primary') || combined.includes('ntrca') || combined.includes('বিসিএস') || combined.includes('bcs')) {
    return { icon: '📚', style: categoryStyles.teaching };
  }
  if (combined.includes('রেলওয়ে') || combined.includes('railway') || combined.includes('রেল')) {
    return { icon: '🚂', style: categoryStyles.gov };
  }
  if (combined.includes('ডাক') || combined.includes('post') || combined.includes('টেলিকম') || combined.includes('telecom') || combined.includes('গ্রামীণফোন') || combined.includes('রবি') || combined.includes('বাংলালিংক')) {
    return { icon: '📡', style: categoryStyles.it };
  }
  if (combined.includes('ইঞ্জিনিয়ার') || combined.includes('engineer') || combined.includes('প্রকৌশল') || combined.includes('এলজিইডি') || combined.includes('lged') || combined.includes('বিদ্যুৎ') || combined.includes('power') || combined.includes('ওয়াসা') || combined.includes('wasa')) {
    return { icon: '⚙️', style: categoryStyles.engineering };
  }
  if (combined.includes('আইটি') || combined.includes('it') || combined.includes('কম্পিউটার') || combined.includes('computer') || combined.includes('software') || combined.includes('সফটওয়্যার') || combined.includes('ডেভেলপার') || combined.includes('developer')) {
    return { icon: '💻', style: categoryStyles.it };
  }
  if (combined.includes('এনজিও') || combined.includes('ngo') || combined.includes('ব্র্যাক') || combined.includes('brac') || combined.includes('আশা') || combined.includes('asha') || combined.includes('উন্নয়ন') || combined.includes('development')) {
    return { icon: '🤝', style: categoryStyles.ngo };
  }
  if (combined.includes('দুদক') || combined.includes('আইন') || combined.includes('বিচার') || combined.includes('court') || combined.includes('আদালত') || combined.includes('বিচারক')) {
    return { icon: '⚖️', style: categoryStyles.gov };
  }
  if (combined.includes('কোম্পানি') || combined.includes('group') || combined.includes('গ্রুপ') || combined.includes('লিমিটেড') || combined.includes('ltd') || combined.includes('private') || combined.includes('বেসরকারি') || combined.includes('প্রাইভেট')) {
    return { icon: '🏢', style: categoryStyles.private };
  }

  // 4. Default Category style fallback
  const directStyle = categoryStyles[cat] || categoryStyles.gov;
  return { icon: directStyle.defaultIcon || '🏛️', style: directStyle };
};
