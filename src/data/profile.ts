/**
 * Personal details used across the site and by the "Ask about Jholan" assistant.
 * Sources: Jholan's CV (public/Jholan-Ligon-CV.pdf) and facts Jholan supplied directly.
 * Empty strings are not rendered. Add only facts you're happy to publish.
 */
export const profile = {
  name: 'Jholan Ligon',
  firstName: 'Jholan',
  role: 'Software developer',
  school: 'National University – Mall of Asia',
  schoolShort: 'NU MOA',
  degree: 'BS Information Technology',
  specialization: 'Mobile and Web Applications',
  year: 'Fourth year',
  graduation: 'Expected August 2027',
  seeking: 'Software development internship',
  statement:
    'I build web and mobile software for real places: a furniture workshop, a call-center training floor, the walk home and the morning market.',
  interests: ['Software engineering', 'Full-stack development', 'Web development', 'Mobile app development', 'UI/UX implementation', 'System development'],

  email: 'ligonjholan04@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jholan-ligon/',
  resume: '/Jholan-Ligon-CV.pdf',
  github: 'https://github.com/JholanL',
  portfolioRepo: 'https://github.com/JholanL/jholan-ligon-portfolio',
};

/** Where a skill is demonstrated. Keys are project ids; 'portfolio' means this website's own code. */
export const evidenceLinks: Record<string, { label: string; href: string }> = {
  topcraft: { label: 'TopCraft', href: '/work/topcraft' },
  voicelink: { label: 'VoiceLink Academy', href: '/work/voicelink' },
  femisafe: { label: 'FemiSafe', href: '/work/femisafe' },
  foodwais: { label: 'FoodWais', href: '/work/foodwais' },
  portfolio: { label: 'This portfolio', href: profile.portfolioRepo },
};

/**
 * Skills from the CV. `in` lists the projects on this site that show the skill;
 * a skill without `in` is listed on the CV but not demonstrated by a project here.
 */
export const skills: { area: string; items: { name: string; in?: string[] }[] }[] = [
  {
    area: 'Languages',
    items: [
      { name: 'JavaScript', in: ['voicelink'] },
      { name: 'TypeScript', in: ['portfolio'] },
      { name: 'Java', in: ['femisafe'] },
      { name: 'Python' },
      { name: 'SQL' },
    ],
  },
  {
    area: 'Frontend',
    items: [
      { name: 'React.js', in: ['voicelink'] },
      { name: 'HTML', in: ['voicelink', 'portfolio'] },
      { name: 'CSS', in: ['voicelink', 'portfolio'] },
    ],
  },
  {
    area: 'Backend',
    items: [
      { name: 'Node.js', in: ['voicelink'] },
      { name: 'Express.js', in: ['voicelink'] },
      { name: 'REST API integration', in: ['voicelink'] },
    ],
  },
  {
    area: 'Mobile',
    items: [{ name: 'Android SDK', in: ['femisafe'] }, { name: 'React Native' }, { name: 'Flutter / Dart' }],
  },
  {
    area: 'Databases',
    items: [{ name: 'MongoDB', in: ['voicelink'] }, { name: 'PostgreSQL' }, { name: 'Firebase Firestore' }],
  },
  {
    area: 'Tools',
    items: [
      { name: 'Git', in: ['voicelink', 'portfolio'] },
      { name: 'GitHub', in: ['voicelink', 'portfolio'] },
      { name: 'Android Studio', in: ['femisafe'] },
      { name: 'VS Code' },
      { name: 'Postman' },
      { name: 'Figma' },
    ],
  },
  {
    area: 'Practice',
    items: [
      { name: 'Project management', in: ['topcraft'] },
      { name: 'Requirements analysis', in: ['topcraft'] },
      { name: 'Functional testing', in: ['topcraft', 'femisafe'] },
      { name: 'Backend configuration & troubleshooting', in: ['voicelink'] },
      { name: 'Image datasets for classification', in: ['foodwais'] },
    ],
  },
];

export const education: { title: string; place: string; detail: string; when: string }[] = [
  {
    title: 'BS Information Technology',
    place: 'National University – Mall of Asia, Pasay City',
    detail: 'Specialization in Mobile and Web Applications · Fourth year',
    when: 'Expected Aug 2027',
  },
  {
    title: 'Senior High School, With Honors',
    place: 'Emilio Aguinaldo College Cavite, Dasmariñas City',
    detail: 'Graduated with honors',
    when: 'July 2023',
  },
];

/** Verified honors and milestones, most significant first. */
export const achievements: { kind: string; title: string; detail: string; href?: string }[] = [
  { kind: 'Academic honor', title: "Dean's First Honor", detail: '7 consecutive terms, AY 2023–2024 to Term 1, AY 2025–2026' },
  { kind: 'Academic honor', title: "Dean's Second Honor", detail: 'Terms 2–3, AY 2025–2026' },
  { kind: 'Scholarship', title: 'University Academic Excellence Benefit (UAEB-100A)', detail: 'Academic scholarship' },
  { kind: 'Leadership', title: 'Project manager, TopCraft capstone', detail: 'Led a four-member team, 2025–2026', href: '/work/topcraft' },
  { kind: 'Hackathon', title: 'AppBuildersPH Hackathon 2026', detail: 'Participant with team CocoJJAM; built FoodWais', href: '/work/foodwais' },
];
