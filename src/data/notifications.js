export const notifications = [
  {
    id: 'notif-1',
    title: 'নতুন চাকরির খবর',
    organization: 'বাংলাদেশ ব্যাংক',
    message: 'অফিসার (জেনারেল) পদে ১২০ জনের নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে। আজই আবেদন করুন।',
    time: '২ ঘণ্টা আগে',
    isRead: false,
    type: 'new_job'
  },
  {
    id: 'notif-2',
    title: 'আবেদনের শেষ তারিখ',
    organization: 'শিক্ষা মন্ত্রণালয়',
    message: 'অফিস সহায়ক পদে আবেদনের সময় শেষ হচ্ছে আগামীকাল। দ্রুত আবেদন সম্পন্ন করুন।',
    time: '৫ ঘণ্টা আগে',
    isRead: false,
    type: 'deadline'
  },
  {
    id: 'notif-3',
    title: 'অ্যাডমিট কার্ড',
    organization: 'সোনালী ব্যাংক লিমিটেড',
    message: 'সিনিয়র অফিসার পদের প্রিলিমিনারি পরীক্ষার অ্যাডমিট কার্ড প্রকাশিত হয়েছে।',
    time: '১ দিন আগে',
    isRead: true,
    type: 'admit_card'
  },
  {
    id: 'notif-4',
    title: 'ফলাফল প্রকাশিত',
    organization: 'বাংলাদেশ পুলিশ',
    message: 'কনস্টেবল পদের চূড়ান্ত ফলাফল ওয়েবসাইটে প্রকাশ করা হয়েছে।',
    time: '১ দিন আগে',
    isRead: true,
    type: 'result'
  },
  {
    id: 'notif-5',
    title: 'নতুন চাকরির খবর',
    organization: 'গ্রামীণফোন',
    message: 'সফটওয়্যার ইঞ্জিনিয়ার পদে নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে।',
    time: '২ দিন আগে',
    isRead: true,
    type: 'new_job'
  },
  {
    id: 'notif-6',
    title: 'আবেদনের শেষ তারিখ',
    organization: 'ব্র্যাক',
    message: 'প্রোগ্রাম অফিসার পদে আবেদনের শেষ দিন আগামী ২৫ মে।',
    time: '২ দিন আগে',
    isRead: true,
    type: 'deadline'
  },
  {
    id: 'notif-7',
    title: 'অ্যাডমিট কার্ড',
    organization: 'ইসলামী ব্যাংক',
    message: 'ক্যাশ অফিসার পদের লিখিত পরীক্ষার অ্যাডমিট কার্ড ডাউনলোড শুরু হয়েছে।',
    time: '৩ দিন আগে',
    isRead: true,
    type: 'admit_card'
  },
  {
    id: 'notif-8',
    title: 'ফলাফল প্রকাশিত',
    organization: 'স্বাস্থ্য অধিদপ্তর',
    message: 'সিনিয়র স্টাফ নার্স পদের মৌখিক পরীক্ষার ফলাফল প্রকাশিত হয়েছে।',
    time: '৪ দিন আগে',
    isRead: true,
    type: 'result'
  },
  {
    id: 'notif-9',
    title: 'নতুন চাকরির খবর',
    organization: 'বাংলাদেশ সেনাবাহিনী',
    message: 'সাধারণ ট্রেডে সৈনিক পদে বিশাল নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে।',
    time: '৫ দিন আগে',
    isRead: true,
    type: 'new_job'
  },
  {
    id: 'notif-10',
    title: 'আবেদনের শেষ তারিখ',
    organization: 'বাংলাদেশ রেলওয়ে',
    message: 'স্টেশন মাস্টার পদে আবেদনের সময়সীমা বৃদ্ধি করা হয়েছে।',
    time: '১ সপ্তাহ আগে',
    isRead: true,
    type: 'deadline'
  }
];

export const admitCardsAndResults = [
  {
    id: 'item-1',
    examName: 'অফিসার (ক্যাশ) প্রিলিমিনারি পরীক্ষা',
    organization: 'সোনালী ব্যাংক লিমিটেড',
    type: 'admit_card',
    status: 'অ্যাডমিট কার্ড পাওয়া যাচ্ছে',
    date: '20 May 2024',
    downloadLink: 'http://example.com/download/1'
  },
  {
    id: 'item-2',
    examName: 'সাব-ইন্সপেক্টর (এসআই) চূড়ান্ত ফলাফল',
    organization: 'বাংলাদেশ পুলিশ',
    type: 'result',
    status: 'ফলাফল প্রকাশিত',
    date: '18 May 2024',
    downloadLink: 'http://example.com/download/2'
  },
  {
    id: 'item-3',
    examName: 'সহকারী শিক্ষক নিয়োগ (১ম ধাপ)',
    organization: 'প্রাথমিক শিক্ষা অধিদপ্তর',
    type: 'result',
    status: 'ফলাফল প্রকাশিত',
    date: '15 May 2024',
    downloadLink: 'http://example.com/download/3'
  },
  {
    id: 'item-4',
    examName: 'অফিস সহায়ক লিখিত পরীক্ষা',
    organization: 'খাদ্য মন্ত্রণালয়',
    type: 'admit_card',
    status: 'অ্যাডমিট কার্ড পাওয়া যাচ্ছে',
    date: '12 May 2024',
    downloadLink: 'http://example.com/download/4'
  },
  {
    id: 'item-5',
    examName: 'সফটওয়্যার ইঞ্জিনিয়ার (টেকনিক্যাল টেস্ট)',
    organization: 'গ্রামীণফোন',
    type: 'admit_card',
    status: 'অ্যাডমিট কার্ড পাওয়া যাচ্ছে',
    date: '10 May 2024',
    downloadLink: 'http://example.com/download/5'
  }
];

export const admitCards = admitCardsAndResults;
