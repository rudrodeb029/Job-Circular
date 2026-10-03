import React from 'react';
import {
  GovIcon,
  BankIcon,
  NgoIcon,
  PrivateIcon,
  TeachingIcon,
  DefenseIcon,
  HealthcareIcon,
  ItIcon,
  EngineeringIcon,
  PartTimeIcon,
  WomenIcon,
  RailwayIcon,
  BcsIcon,
  NtrcaIcon,
  PrimaryIcon,
  RecentQuestionsIcon,
  SubjectwiseIcon,
  getCategoryIconComponent
} from '../components/CategoryIcons';

/**
 * Unified Job Icon and Category Styling Utility.
 * Resolves real vector SVG icons and gradient badges for jobs and circulars.
 */

export const categoryStyles = {
  gov: { bg: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', shadow: 'rgba(29, 78, 216, 0.35)', iconType: 'gov', defaultIcon: <GovIcon size={18} color="white" /> },
  bank: { bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', shadow: 'rgba(5, 150, 105, 0.35)', iconType: 'bank', defaultIcon: <BankIcon size={18} color="white" /> },
  ngo: { bg: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', shadow: 'rgba(234, 88, 12, 0.35)', iconType: 'ngo', defaultIcon: <NgoIcon size={18} color="white" /> },
  private: { bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', shadow: 'rgba(124, 58, 237, 0.35)', iconType: 'private', defaultIcon: <PrivateIcon size={18} color="white" /> },
  teaching: { bg: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)', shadow: 'rgba(219, 39, 119, 0.35)', iconType: 'teaching', defaultIcon: <TeachingIcon size={18} color="white" /> },
  defense: { bg: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', shadow: 'rgba(220, 38, 38, 0.35)', iconType: 'defense', defaultIcon: <DefenseIcon size={18} color="white" /> },
  healthcare: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.35)', iconType: 'healthcare', defaultIcon: <HealthcareIcon size={18} color="white" /> },
  health: { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: 'rgba(13, 148, 136, 0.35)', iconType: 'healthcare', defaultIcon: <HealthcareIcon size={18} color="white" /> },
  it: { bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', shadow: 'rgba(79, 70, 229, 0.35)', iconType: 'it', defaultIcon: <ItIcon size={18} color="white" /> },
  engineering: { bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', shadow: 'rgba(217, 119, 6, 0.35)', iconType: 'engineering', defaultIcon: <EngineeringIcon size={18} color="white" /> },
  parttime: { bg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', shadow: 'rgba(2, 132, 199, 0.35)', iconType: 'parttime', defaultIcon: <PartTimeIcon size={18} color="white" /> },
  women: { bg: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)', shadow: 'rgba(225, 29, 72, 0.35)', iconType: 'women', defaultIcon: <WomenIcon size={18} color="white" /> },
  railway: { bg: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', shadow: 'rgba(8, 145, 178, 0.35)', iconType: 'railway', defaultIcon: <RailwayIcon size={18} color="white" /> }
};

export const orgIconsMap = {
  'শিক্ষা মন্ত্রণালয়': <GovIcon size={18} color="white" />,
  'মহিলা বিষয়ক অধিদপ্তর': <WomenIcon size={18} color="white" />,
  'মহিলা ও শিশু বিষয়ক মন্ত্রণালয়': <WomenIcon size={18} color="white" />,
  'সোনালী ব্যাংক লিমিটেড': <BankIcon size={18} color="white" />,
  'বাংলাদেশ পুলিশ': <DefenseIcon size={18} color="white" />,
  'ব্র্যাক': <NgoIcon size={18} color="white" />,
  'গ্রামীণফোন': <ItIcon size={18} color="white" />,
  'বাংলাদেশ সেনাবাহিনী': <DefenseIcon size={18} color="white" />,
  'ইসলামী ব্যাংক': <BankIcon size={18} color="white" />,
  'বাংলাদেশ রেলওয়ে': <RailwayIcon size={18} color="white" />,
  'ডাক ও টেলিযোগাযোগ মন্ত্রণালয়': <GovIcon size={18} color="white" />,
  'স্বাস্থ্য অধিদপ্তর': <HealthcareIcon size={18} color="white" />,
  'বাংলাদেশ ব্যাংক': <BankIcon size={18} color="white" />,
  'ভিকারুননিসা নূন স্কুল এন্ড কলেজ': <TeachingIcon size={18} color="white" />,
  'এলজিইডি': <EngineeringIcon size={18} color="white" />,
  'বিকাশ লিমিটেড': <BankIcon size={18} color="white" />,
  'আশা': <NgoIcon size={18} color="white" />,
  'জনতা ব্যাংক': <BankIcon size={18} color="white" />,
  'স্কয়ার হাসপাতাল': <HealthcareIcon size={18} color="white" />,
  'পাঠাও': <ItIcon size={18} color="white" />,
  'রাজউক উত্তরা মডেল কলেজ': <TeachingIcon size={18} color="white" />,
  'রূপালী ব্যাংক': <BankIcon size={18} color="white" />,
  'আকিক গ্রুপ': <PrivateIcon size={18} color="white" />,
  'ওয়াটারএইড বাংলাদেশ': <NgoIcon size={18} color="white" />,
  'টেন মিনিট স্কুল': <TeachingIcon size={18} color="white" />,
  'প্রাণ-আরএফএল গ্রুপ': <PrivateIcon size={18} color="white" />,
  'পপুলার ডায়াগনস্টিক সেন্টার': <HealthcareIcon size={18} color="white" />,
  'বেক্সিমকো ফার্মা': <HealthcareIcon size={18} color="white" />,
  'ফাইবার অ্যাট হোম': <ItIcon size={18} color="white" />,
  'দুর্নীতি দমন কমিশন (দুদক)': <GovIcon size={18} color="white" />,
  'স্বপ্ন সুপার শপ': <PrivateIcon size={18} color="white" />
};

export const getJobIconAndStyle = (job) => {
  const defaultGov = categoryStyles.gov;
  if (!job) return { icon: defaultGov.defaultIcon, style: defaultGov };

  const rawCat = (job.category || job.categoryId || '').toLowerCase();
  const catStyle = categoryStyles[rawCat] || categoryStyles.gov;

  // 1. If job has an explicit icon specified and it's already an element
  if (job.icon && React.isValidElement(job.icon)) {
    return { icon: job.icon, style: catStyle };
  }

  const org = (job.organization || '').toLowerCase();
  const orgEn = (job.organizationEn || '').toLowerCase();
  const title = (job.title || '').toLowerCase();
  const titleEn = (job.titleEn || '').toLowerCase();
  const combined = `${org} ${orgEn} ${title} ${titleEn} ${rawCat}`;

  // 2. Exact match in orgIconsMap
  if (job.organization && orgIconsMap[job.organization]) {
    const matchedIcon = orgIconsMap[job.organization];
    return { icon: matchedIcon, style: catStyle };
  }

  // 3. Domain and keyword smart matching with real vector icons
  if (combined.includes('মহিলা') || combined.includes('women') || combined.includes('শিশু')) {
    return { icon: <WomenIcon size={18} color="white" />, style: categoryStyles.women };
  }
  if (combined.includes('পুলিশ') || combined.includes('police') || combined.includes('সেনা') || combined.includes('army') || combined.includes('সৈনিক') || combined.includes('sainik') || combined.includes('defense') || combined.includes('প্রতিরক্ষা') || combined.includes('নৌবাহিনী') || combined.includes('navy') || combined.includes('বিমান') || combined.includes('air force') || combined.includes('বিজিবি') || combined.includes('bgb') || combined.includes('আনসার') || combined.includes('কারারক্ষী')) {
    return { icon: <DefenseIcon size={18} color="white" />, style: categoryStyles.defense };
  }
  if (combined.includes('ব্যাংক') || combined.includes('bank') || combined.includes('সোনালী') || combined.includes('জনতা') || combined.includes('রূপালী') || combined.includes('অগ্রণী') || combined.includes('বাংলাদেশ ব্যাংক') || combined.includes('bKash') || combined.includes('nagad')) {
    return { icon: <BankIcon size={18} color="white" />, style: categoryStyles.bank };
  }
  if (combined.includes('স্বাস্থ্য') || combined.includes('health') || combined.includes('হাসপাতাল') || combined.includes('hospital') || combined.includes('মেডিকেল') || combined.includes('medical') || combined.includes('ডাক্তার') || combined.includes('doctor') || combined.includes('নার্স') || combined.includes('nurse') || combined.includes('ফার্মা') || combined.includes('pharma') || combined.includes('ঔষধ') || combined.includes('clinic')) {
    return { icon: <HealthcareIcon size={18} color="white" />, style: categoryStyles.healthcare };
  }
  if (combined.includes('শিক্ষা') || combined.includes('teacher') || combined.includes('শিক্ষক') || combined.includes('স্কুল') || combined.includes('school') || combined.includes('কলেজ') || combined.includes('college') || combined.includes('বিশ্ববিদ্যালয়') || combined.includes('university') || combined.includes('মাদরাসা') || combined.includes('teaching') || combined.includes('প্রাইমারি') || combined.includes('primary') || combined.includes('ntrca') || combined.includes('বিসিএস') || combined.includes('bcs')) {
    return { icon: <TeachingIcon size={18} color="white" />, style: categoryStyles.teaching };
  }
  if (combined.includes('রেলওয়ে') || combined.includes('railway') || combined.includes('রেল')) {
    return { icon: <RailwayIcon size={18} color="white" />, style: categoryStyles.railway || categoryStyles.gov };
  }
  if (combined.includes('ডাক') || combined.includes('post') || combined.includes('টেলিকম') || combined.includes('telecom') || combined.includes('গ্রামীণফোন') || combined.includes('রবি') || combined.includes('বাংলালিংক') || combined.includes('আইটি') || combined.includes('it') || combined.includes('কম্পিউটার') || combined.includes('computer') || combined.includes('software') || combined.includes('সফটওয়্যার') || combined.includes('ডেভেলপার') || combined.includes('developer')) {
    return { icon: <ItIcon size={18} color="white" />, style: categoryStyles.it };
  }
  if (combined.includes('ইঞ্জিনিয়ার') || combined.includes('engineer') || combined.includes('প্রকৌশল') || combined.includes('এলজিইডি') || combined.includes('lged') || combined.includes('বিদ্যুৎ') || combined.includes('power') || combined.includes('ওয়াসা') || combined.includes('wasa')) {
    return { icon: <EngineeringIcon size={18} color="white" />, style: categoryStyles.engineering };
  }
  if (combined.includes('এনজিও') || combined.includes('ngo') || combined.includes('ব্র্যাক') || combined.includes('brac') || combined.includes('আশা') || combined.includes('asha') || combined.includes('উন্নয়ন') || combined.includes('development')) {
    return { icon: <NgoIcon size={18} color="white" />, style: categoryStyles.ngo };
  }
  if (combined.includes('কোম্পানি') || combined.includes('group') || combined.includes('গ্রুপ') || combined.includes('লিমিটেড') || combined.includes('ltd') || combined.includes('private') || combined.includes('বেসরকারি') || combined.includes('প্রাইভেট')) {
    return { icon: <PrivateIcon size={18} color="white" />, style: categoryStyles.private };
  }

  // 4. Fallback to real vector icon for the category
  const fallbackIcon = getCategoryIconComponent(rawCat, { size: 18, color: 'white' });
  return { icon: fallbackIcon, style: catStyle };
};
