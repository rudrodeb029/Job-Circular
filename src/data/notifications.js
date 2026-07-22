export const notifications = [
  {
    id: 'notif-1',
    title: 'নতুন চাকরির খবর',
    organization: 'বাংলাদেশ ব্যাংক',
    message: 'অফিসার (জেনারেল) পদে ১২০ জনের নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে। আজই আবেদন করুন।',
    time: '২ ঘণ্টা আগে',
    isRead: false,
    type: 'new_job',
    jobId: 'job-11'
  },
  {
    id: 'notif-2',
    title: 'আবেদনের শেষ তারিখ',
    organization: 'শিক্ষা মন্ত্রণালয়',
    message: 'অফিস সহায়ক পদে আবেদনের সময় শেষ হচ্ছে আগামীকাল। দ্রুত আবেদন সম্পন্ন করুন।',
    time: '৫ ঘণ্টা আগে',
    isRead: false,
    type: 'deadline',
    jobId: 'job-1'
  },
  {
    id: 'notif-3',
    title: 'অ্যাডমিট কার্ড',
    organization: 'সোনালী ব্যাংক লিমিটেড',
    message: 'সিনিয়র অফিসার পদের প্রিলিমিনারি পরীক্ষার অ্যাডমিট কার্ড প্রকাশিত হয়েছে।',
    time: '১ দিন আগে',
    isRead: true,
    type: 'admit_card',
    jobId: 'job-2'
  },
  {
    id: 'notif-4',
    title: 'ফলাফল প্রকাশিত',
    organization: 'বাংলাদেশ পুলিশ',
    message: 'কনস্টেবল পদের চূড়ান্ত ফলাফল ওয়েবসাইটে প্রকাশ করা হয়েছে।',
    time: '১ দিন আগে',
    isRead: true,
    type: 'result',
    jobId: 'job-3'
  },
  {
    id: 'notif-5',
    title: 'নতুন চাকরির খবর',
    organization: 'গ্রামীণফোন',
    message: 'সফটওয়্যার ইঞ্জিনিয়ার পদে নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে।',
    time: '২ দিন আগে',
    isRead: true,
    type: 'new_job',
    jobId: 'job-4'
  },
  {
    id: 'notif-6',
    title: 'আবেদনের শেষ তারিখ',
    organization: 'ব্র্যাক',
    message: 'প্রোগ্রাম অফিসার পদে আবেদনের শেষ দিন আগামী ২৫ মে।',
    time: '২ দিন আগে',
    isRead: true,
    type: 'deadline',
    jobId: 'job-5'
  },
  {
    id: 'notif-7',
    title: 'অ্যাডমিট কার্ড',
    organization: 'ইসলামী ব্যাংক',
    message: 'ক্যাশ অফিসার পদের লিখিত পরীক্ষার অ্যাডমিট কার্ড ডাউনলোড শুরু হয়েছে।',
    time: '৩ দিন আগে',
    isRead: true,
    type: 'admit_card',
    jobId: 'job-7'
  },
  {
    id: 'notif-8',
    title: 'ফলাফল প্রকাশিত',
    organization: 'স্বাস্থ্য অধিদপ্তর',
    message: 'সিনিয়র স্টাফ নার্স পদের মৌখিক পরীক্ষার ফলাফল প্রকাশিত হয়েছে।',
    time: '৪ দিন আগে',
    isRead: true,
    type: 'result',
    jobId: 'job-10'
  },
  {
    id: 'notif-9',
    title: 'নতুন চাকরির খবর',
    organization: 'বাংলাদেশ সেনাবাহিনী',
    message: 'সাধারণ ট্রেডে সৈনিক পদে বিশাল নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে।',
    time: '৫ দিন আগে',
    isRead: true,
    type: 'new_job',
    jobId: 'job-6'
  },
  {
    id: 'notif-10',
    title: 'আবেদনের শেষ তারিখ',
    organization: 'বাংলাদেশ রেলওয়ে',
    message: 'স্টেশন মাস্টার পদে আবেদনের সময়সীমা বৃদ্ধি করা হয়েছে।',
    time: '১ সপ্তাহ আগে',
    isRead: true,
    type: 'deadline',
    jobId: 'job-8'
  }
];

export const admitCardsAndResults = [
  {
    id: 'job-2',
    examName: 'অফিসার (ক্যাশ) প্রিলিমিনারি পরীক্ষা',
    examNameEn: 'Officer (Cash) Preliminary Exam',
    organization: 'সোনালী ব্যাংক লিমিটেড',
    organizationEn: 'Sonali Bank Limited',
    type: 'admit_card',
    status: 'অ্যাডমিট কার্ড পাওয়া যাচ্ছে',
    statusEn: 'Admit Card Available',
    date: '২০ মে ২০২৪',
    dateEn: '20 May 2024',
    downloadLink: '#'
  },
  {
    id: 'job-3',
    examName: 'কনস্টেবল নিয়োগ লিখিত পরীক্ষার ফলাফল',
    examNameEn: 'Constable Recruitment Written Exam Result',
    organization: 'বাংলাদেশ পুলিশ',
    organizationEn: 'Bangladesh Police',
    type: 'result',
    status: 'ফলাফল প্রকাশিত',
    statusEn: 'Result Published',
    date: '১৮ মে ২০২৪',
    dateEn: '18 May 2024',
    downloadLink: '#'
  },
  {
    id: 'job-1',
    examName: 'অফিস সহায়ক পদের ভাইভা পরীক্ষা',
    examNameEn: 'Office Assistant Viva Exam',
    organization: 'শিক্ষা মন্ত্রণালয়',
    organizationEn: 'Ministry of Education',
    type: 'admit_card',
    status: 'অ্যাডমিট কার্ড পাওয়া যাচ্ছে',
    statusEn: 'Admit Card Available',
    date: '১৫ মে ২০২৪',
    dateEn: '15 May 2024',
    downloadLink: '#'
  },
  {
    id: 'job-7',
    examName: 'ক্যাশ অফিসার প্রিলিমিনারি রেজাল্ট',
    examNameEn: 'Cash Officer Preliminary Result',
    organization: 'ইসলামী ব্যাংক',
    organizationEn: 'Islami Bank',
    type: 'result',
    status: 'ফলাফল প্রকাশিত',
    statusEn: 'Result Published',
    date: '১২ মে ২০২৪',
    dateEn: '12 May 2024',
    downloadLink: '#'
  },
  {
    id: 'job-10',
    examName: 'সিনিয়র স্টাফ নার্স পদের নিয়োগ পরীক্ষার ফলাফল',
    examNameEn: 'Senior Staff Nurse Exam Result',
    organization: 'স্বাস্থ্য অধিদপ্তর',
    organizationEn: 'Health Directorate',
    type: 'result',
    status: 'ফলাফল প্রকাশিত',
    statusEn: 'Result Published',
    date: '১০ মে ২০২৪',
    dateEn: '10 May 2024',
    downloadLink: '#'
  }
];

export const admitCards = admitCardsAndResults;
