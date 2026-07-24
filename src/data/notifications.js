import { jobs as defaultJobs } from './jobs';

export const getNotifications = () => {
  const localJobs = (() => {
    try {
      const saved = localStorage.getItem('admin_jobs');
      return saved ? JSON.parse(saved) : defaultJobs;
    } catch (e) {
      return defaultJobs;
    }
  })();

  const jobNotifs = localJobs.map(job => ({
    ...job,
    id: `notif_job_${job.id}`,
    title: 'নতুন চাকরির খবর',
    titleEn: 'New Job Circular',
    organization: job.organization,
    organizationEn: job.organizationEn,
    message: `${job.title} পদে নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে। আজই আবেদন করুন।`,
    messageEn: `New job circular published for ${job.titleEn || job.title}. Apply today!`,
    time: job.postedDate || '১৫ মিনিট আগে',
    timeEn: job.postedDateEn || '15 mins ago',
    type: 'new_job',
    jobId: job.id
  }));

  const examNotifs = localJobs.filter(job => job.examDate).map(job => ({
    ...job,
    id: `notif_exam_${job.id}`,
    title: 'অ্যাডমিট কার্ড',
    titleEn: 'Exam Date Notice',
    organization: job.organization,
    organizationEn: job.organizationEn,
    message: `${job.title} পদের পরীক্ষার তারিখ প্রকাশিত হয়েছে।`,
    messageEn: `Exam date notice published for ${job.titleEn || job.title}.`,
    time: job.postedDate || '১ দিন আগে',
    timeEn: job.postedDateEn || '1 day ago',
    type: 'admit_card',
    jobId: job.id
  }));

  const resultNotifs = localJobs.filter(job => job.examResult).map(job => ({
    ...job,
    id: `notif_result_${job.id}`,
    title: 'ফলাফল প্রকাশিত',
    titleEn: 'Result Published',
    organization: job.organization,
    organizationEn: job.organizationEn,
    message: `${job.title} পদের পরীক্ষার ফলাফল প্রকাশিত হয়েছে।`,
    messageEn: `Exam result published for ${job.titleEn || job.title}.`,
    time: job.postedDate || '১ দিন আগে',
    timeEn: job.postedDateEn || '1 day ago',
    type: 'result',
    jobId: job.id
  }));

  const getItemTimestamp = (item) => {
    if (item.createdAt) {
      const ms = new Date(item.createdAt).getTime();
      if (!isNaN(ms)) return ms;
    }
    if (item.id) {
      const matches = item.id.match(/\d{10,13}/);
      if (matches) return parseInt(matches[0], 10);
    }
    if (item.postedAt) {
      const ms = new Date(item.postedAt).getTime();
      if (!isNaN(ms)) return ms;
    }
    return 0;
  };

  return [...jobNotifs, ...examNotifs, ...resultNotifs]
    .sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
};

export const notifications = getNotifications();

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
