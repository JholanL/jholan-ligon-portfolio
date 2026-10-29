/**
 * Personal details used across the site. Empty strings are simply not rendered,
 * so fill these in when you are ready to publish them.
 */
export const profile = {
  name: 'Jholan Ligon',
  firstName: 'Jholan',
  role: 'Software developer · BS Information Technology student',
  school: 'National University – Mall of Asia',
  degree: 'BS Information Technology',
  specialization: 'Mobile and Web Applications',
  year: 'Fourth year',
  seeking: 'Software development internship',
  statement:
    'I build web and mobile software for real places: a furniture workshop, a call-center training floor, the walk home and the morning market.',
  interests: ['Software engineering', 'Full-stack development', 'Web development', 'Mobile app development', 'UI/UX implementation', 'System development'],

  // Contact — add yours before publishing. Leave '' to hide a row.
  email: '',
  linkedin: '',
  resume: '', // e.g. '/Jholan-Ligon-Resume.pdf' after placing the file in public/
  github: 'https://github.com/JholanL',
};

/**
 * Skills, each tied to the project that shows it. Only list what the work proves;
 * add more groups as you confirm them (languages, mobile frameworks, tools...).
 */
export const toolkit: { area: string; items: string[]; proof: { label: string; href: string }[]; note?: string }[] = [
  {
    area: 'Full-stack web',
    items: ['React', 'React Router', 'Vite', 'Node.js', 'Express', 'REST APIs', 'MongoDB', 'Mongoose'],
    proof: [{ label: 'VoiceLink Academy', href: '/work/voicelink' }],
  },
  {
    area: 'Auth & backend safety',
    items: ['JWT', 'bcrypt', 'Role & ownership checks', 'Rate limiting', 'Input validation', 'DB connection safeguards'],
    proof: [{ label: 'VoiceLink Academy', href: '/work/voicelink' }],
    note: 'Authentication workflows and connection safeguards were my documented responsibilities.',
  },
  {
    area: 'Testing',
    items: ['Node.js test runner', 'API test suites', 'Concurrency checks', 'Server dependency testing'],
    proof: [{ label: 'VoiceLink Academy', href: '/work/voicelink' }],
  },
  {
    area: 'Mobile',
    items: ['Android apps', 'Offline-first features', 'SMS and location flows', 'Role-based mobile UX'],
    proof: [
      { label: 'FemiSafe', href: '/work/femisafe' },
      { label: 'TopCraft', href: '/work/topcraft' },
    ],
  },
  {
    area: 'Product & UI',
    items: ['Role-based dashboards', 'Responsive layouts', 'Design tokens', 'Light & dark themes'],
    proof: [
      { label: 'TopCraft', href: '/work/topcraft' },
      { label: 'VoiceLink Academy', href: '/work/voicelink' },
    ],
  },
  {
    area: 'Team workflow',
    items: ['Git', 'Feature branches', 'Code ownership by module', 'Client collaboration', 'Hackathons'],
    proof: [
      { label: 'VoiceLink Academy', href: '/work/voicelink' },
      { label: 'TopCraft', href: '/work/topcraft' },
      { label: 'FoodWais', href: '/work/foodwais' },
    ],
  },
];

/** Education and recognition. Only verified entries. */
export const timeline: { when: string; title: string; detail: string }[] = [
  {
    when: 'Now',
    title: 'BS Information Technology, Fourth year',
    detail: 'National University – Mall of Asia · Specialization in Mobile and Web Applications',
  },
  {
    when: 'Capstone',
    title: 'TopCraft for Industrial Manila Furniture',
    detail: 'Client-based capstone: an owner web platform and an Android app for clients and workers.',
  },
  {
    when: 'Hackathon',
    title: 'AppBuildersPH Hackathon',
    detail: 'Built FoodWais with team CocoJJAM: a local-AI concept for freshness, pantry and fair prices.',
  },
  {
    when: 'Coursework',
    title: 'CTADWEBL · Advanced Web Programming',
    detail: 'Final project: VoiceLink Academy, a three-portal MERN LMS built by a team of three.',
  },
];
