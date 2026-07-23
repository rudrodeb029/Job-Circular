// Default initial live exams. Start times are relative to now for dynamic testing.
const now = Date.now();

export const defaultLiveExams = [
  {
    id: 'live-exam-1',
    title: 'বিসিএস লাইভ মডেল টেস্ট - ০১ (সাধারণ জ্ঞান)',
    titleEn: 'BCS Live Model Test - 01 (General Knowledge)',
    startTime: new Date(now + 2 * 60 * 1000).toISOString(), // Starts in 2 minutes
    duration: 10, // 10 minutes
    subjects: 'সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক)',
    subjectsEn: 'General Knowledge (Bangladesh & International)',
    topics: 'ভাষা আন্দোলন, মুক্তিযুদ্ধ, ভৌগোলিক অবস্থান',
    topicsEn: 'Language Movement, Liberation War, Geography',
    questions: [
      {
        question: 'বাংলা একাডেমি কত সালে প্রতিষ্ঠিত হয়?',
        questionEn: 'In which year was Bangla Academy established?',
        options: ['১৯৫২', '১৯৫৫', '১৯৫৮', '১৯৬২'],
        optionsEn: ['1952', '1955', '1958', '1962'],
        correctIndex: 1,
        explanation: '১৯৫৫ সালের ৩ ডিসেম্বর বাংলা একাডেমি প্রতিষ্ঠিত হয়।',
        explanationEn: 'Bangla Academy was established on December 3, 1955.'
      },
      {
        question: 'বাংলাদেশের সর্বউত্তরের জেলা কোনটি?',
        questionEn: 'Which is the northernmost district of Bangladesh?',
        options: ['দিনাজপুর', 'পঞ্চগড়', 'ঠাকুরগাঁও', 'কুড়িগ্রাম'],
        optionsEn: ['Dinajpur', 'Panchagarh', 'Thakurgaon', 'Kurigram'],
        correctIndex: 1,
        explanation: 'বাংলাদেশের সর্বউত্তরের জেলা পঞ্চগড় এবং সর্বউত্তরের থানা তেঁতুলিয়া।',
        explanationEn: 'Panchagarh is the northernmost district of Bangladesh.'
      },
      {
        question: 'মুক্তির গান চলচ্চিত্রের পরিচালক কে?',
        questionEn: 'Who is the director of the film "Muktir Gaan"?',
        options: ['জহির রায়হান', 'তারেক মাসুদ', 'মোস্তফা সরয়ার ফারুকী', 'হুমায়ূন আহমেদ'],
        optionsEn: ['Zahir Raihan', 'Tareque Masud', 'Mostofa Sarwar Farooki', 'Humayun Ahmed'],
        correctIndex: 1,
        explanation: 'মুক্তির গান তারেক মাসুদ ও ক্যাথরিন মাসুদ পরিচালিত একটি বিখ্যাত প্রামাণ্যচিত্র।',
        explanationEn: 'Muktir Gaan is a famous documentary film directed by Tareque Masud and Catherine Masud.'
      }
    ]
  },
  {
    id: 'live-exam-2',
    title: 'প্রাইমারি শিক্ষক নিয়োগ লাইভ পরীক্ষা - ০২',
    titleEn: 'Primary Assistant Teacher Live Exam - 02',
    startTime: new Date(now + 60 * 60 * 1000).toISOString(), // Starts in 1 hour
    duration: 15,
    subjects: 'গণিত ও বাংলা',
    subjectsEn: 'Mathematics & Bengali',
    topics: 'মৌলিক সংখ্যা, শুদ্ধ বানান, এককথায় প্রকাশ',
    topicsEn: 'Prime Numbers, Spelling, One Word Substitution',
    questions: [
      {
        question: 'কোনটি মৌলিক সংখ্যা?',
        questionEn: 'Which one is a prime number?',
        options: ['৯', '১৫', '৪৭', '৪৯'],
        optionsEn: ['9', '15', '47', '49'],
        correctIndex: 2,
        explanation: '৪৭ একটি মৌলিক সংখ্যা কারণ এর কেবল ২টি উৎপাদক (১ এবং ৪৭) রয়েছে।',
        explanationEn: '47 is a prime number because it is only divisible by 1 and itself.'
      }
    ]
  }
];

export const getLiveExams = () => {
  try {
    const saved = localStorage.getItem('admin_live_exams');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return defaultLiveExams;
};

export const saveLiveExams = (exams) => {
  try {
    localStorage.setItem('admin_live_exams', JSON.stringify(exams));
  } catch (e) {
    console.error(e);
  }
};
