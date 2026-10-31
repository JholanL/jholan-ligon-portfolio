/**
 * Knowledge base for the "Ask about Jholan" search assistant.
 *
 * Every answer is assembled from verified sources only: src/data/profile.ts (Jholan's CV and
 * facts Jholan supplied), the project files in src/content/projects/ and the certificates in
 * src/content/certificates/. It is published as /assistant.json at build time and searched in
 * the browser. Nothing a visitor types leaves their browser.
 *
 * To change what the assistant knows, edit those sources (or the entries below) and rebuild.
 * Do not add anything you wouldn't put on the public site.
 */
import { getCollection } from 'astro:content';
import { profile, skills, education, achievements } from './profile';

export interface Entry {
  id: string;
  title: string;
  /** Words and phrases that should match this entry (lowercase). */
  keywords: string[];
  /** Project id, when the entry is about one project. */
  project?: string;
  /** Aspect of a project: overview, contribution, tech, status, ai. */
  aspect?: string;
  answer: string;
  links?: { label: string; href: string }[];
}

const list = (items: string[]) => items.map((i) => `• ${i}`).join('\n');
const joinAnd = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

export async function buildKnowledge(): Promise<{ version: number; projectNames: Record<string, string[]>; entries: Entry[] }> {
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  const certs = (await getCollection('certificates')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const P = Object.fromEntries(projects.map((p) => [p.id, p.data]));
  const link = (id: string) => ({ label: `${P[id].name} case study`, href: `/work/${id}` });
  const contribution = (id: string) => P[id].sections.find((s) => s.type === 'contribution');
  const stack = (id: string) => P[id].sections.find((s) => s.type === 'stack');

  const entries: Entry[] = [];
  const add = (e: Entry) => entries.push(e);

  /* ---------------------------------------------------------------- about */
  add({
    id: 'about',
    title: 'About Jholan',
    keywords: ['who', 'about', 'jholan', 'introduce', 'introduction', 'background', 'summary', 'overview', 'tell me about jholan', 'profile', 'student', 'developer'],
    answer: `${profile.name} is a software developer and ${profile.year.toLowerCase()} ${profile.degree} student at ${profile.school}, specializing in ${profile.specialization} (${profile.graduation.toLowerCase()}). Jholan builds web and mobile applications and is open to a ${profile.seeking.toLowerCase()}.`,
    links: [{ label: 'About section', href: '/#about' }, { label: 'Résumé (PDF)', href: profile.resume }],
  });

  add({
    id: 'projects',
    title: 'Projects',
    keywords: ['projects', 'project', 'built', 'build', 'portfolio', 'work', 'apps', 'applications', 'made', 'created', 'developed', 'what has', 'experience'],
    answer: `Four projects are featured:\n${list(projects.map((p) => `${p.data.name}: ${p.data.kind.split('·')[0].trim().toLowerCase()}, ${p.data.platforms.join(' + ').toLowerCase()}${p.data.year ? `, ${p.data.year}` : ''} (${p.data.team.toLowerCase()}${p.data.role ? `; ${p.data.role.toLowerCase()}` : ''})`))}`,
    links: projects.map((p) => link(p.id)),
  });

  /* ------------------------------------------------------------- projects */
  for (const p of projects) {
    const d = p.data;
    const names = [d.name.toLowerCase(), p.id];
    add({
      id: `${p.id}-overview`,
      title: d.name,
      project: p.id,
      aspect: 'overview',
      keywords: [...names, 'overview', 'what is', 'about', 'tell me'],
      answer: `${d.name} (${d.kind}${d.year ? `, ${d.year}` : ''}): ${d.summary}${d.status ? `\nStatus: ${d.status}` : ''}`,
      links: [link(p.id), ...d.links],
    });

    const c = contribution(p.id);
    if (c && c.type === 'contribution') {
      add({
        id: `${p.id}-contribution`,
        title: `${d.name}: Jholan's part`,
        project: p.id,
        aspect: 'contribution',
        keywords: [...names, 'contribute', 'contribution', 'contributed', 'role', 'part', 'did', 'responsible', 'responsibilities', 'work on', 'own', 'team'],
        answer: `${d.team === 'Solo developer' ? `${d.name} is a solo project` : `${d.name} was built by ${d.team.startsWith('Team of') ? `a ${d.team.toLowerCase()}` : d.team}`}. Jholan's part:\n${list(c.mine)}${c.team?.length ? `\nTeam context:\n${list(c.team)}` : ''}`,
        links: [link(p.id)],
      });
    }

    const s = stack(p.id);
    add({
      id: `${p.id}-tech`,
      title: `${d.name}: technology`,
      project: p.id,
      aspect: 'tech',
      keywords: [...names, 'tech', 'technology', 'technologies', 'stack', 'built with', 'language', 'framework', 'tools', 'database'],
      answer:
        s && s.type === 'stack'
          ? `${d.name} is built with:\n${list(s.groups.map((g) => `${g.name}: ${g.items.join(', ')}`))}`
          : p.id === 'topcraft'
            ? `TopCraft is a web platform plus an Android app. Its AI features (concept sheets, scrap suggestions, production insights, the client assistant and the worker schedule) are tagged as generated by Google Gemini in the app's saved responses. The rest of the stack isn't listed in the portfolio yet.`
            : p.id === 'foodwais'
              ? `FoodWais is a mobile prototype that assesses meat and fish freshness with image classification; Jholan worked with the fish, pork, chicken and beef image datasets. The framework and model aren't listed in the portfolio yet.`
              : `${d.name}'s stack isn't listed in the portfolio yet.`,
      links: [link(p.id)],
    });
  }

  /* --------------------------------------------------------------- skills */
  add({
    id: 'skills',
    title: 'Technologies and skills',
    keywords: ['technologies', 'technology', 'tech', 'stack', 'skills', 'skill', 'languages', 'language', 'programming', 'frameworks', 'tools', 'know', 'use', 'proficient'],
    answer: `From Jholan's CV:\n${list(skills.map((g) => `${g.area}: ${g.items.map((i) => i.name).join(', ')}`))}\nThe Skills section marks which of these are shown in a project on this site.`,
    links: [{ label: 'Skills section', href: '/#skills' }, { label: 'Résumé (PDF)', href: profile.resume }],
  });

  const vl = contribution('voicelink');
  add({
    id: 'backend',
    title: 'Backend experience',
    keywords: ['backend', 'back-end', 'back end', 'server', 'api', 'apis', 'rest', 'node', 'nodejs', 'express', 'database', 'databases', 'mongodb', 'full-stack', 'fullstack', 'full stack'],
    answer: `Yes. On VoiceLink Academy (React, Node.js, Express and MongoDB, in a team of three), Jholan's documented part was:\n${list(vl && vl.type === 'contribution' ? vl.mine : [])}\nThe CV also lists Node.js, Express.js and REST API integration, plus MongoDB, PostgreSQL and Firebase Firestore.`,
    links: [link('voicelink')],
  });

  add({
    id: 'frontend',
    title: 'Frontend experience',
    keywords: ['frontend', 'front-end', 'front end', 'react', 'html', 'css', 'ui', 'interface', 'web development', 'design', 'ux', 'components'],
    answer: `The CV lists React.js, HTML and CSS. On TopCraft, Jholan developed application features and UI components; VoiceLink Academy's client is a React single-page app; and this portfolio is built with Astro and TypeScript.`,
    links: [link('topcraft'), link('voicelink'), { label: 'Portfolio source on GitHub', href: profile.portfolioRepo }],
  });

  add({
    id: 'mobile',
    title: 'Mobile experience',
    keywords: ['mobile', 'android', 'ios', 'app', 'apps', 'java', 'kotlin', 'flutter', 'react native', 'android studio', 'phone'],
    answer: `• FemiSafe: a native Android app Jholan built independently in Java with Android Studio.\n• TopCraft: a web platform plus an Android app for clients and workers (team of four; Jholan was project manager and developed features and UI components).\n• FoodWais: a hackathon mobile prototype (team CocoJJAM).\nThe CV also lists React Native, Flutter/Dart and the Android SDK.`,
    links: [link('femisafe'), link('topcraft'), link('foodwais')],
  });

  add({
    id: 'solo-team',
    title: 'Independent and team projects',
    keywords: ['independent', 'independently', 'solo', 'alone', 'individual', 'individually', 'own', 'by themselves', 'team', 'teams', 'group', 'collaborative', 'collaboration', 'teamwork'],
    answer: `Independent: FemiSafe (built solo).\nTeam projects:\n• TopCraft: four-member capstone team; Jholan was project manager.\n• VoiceLink Academy: team of three; each member owned one portal.\n• FoodWais: team CocoJJAM at the AppBuildersPH Hackathon.`,
    links: [link('femisafe'), link('topcraft'), link('voicelink'), link('foodwais')],
  });

  add({
    id: 'leadership',
    title: 'Leadership',
    keywords: ['lead', 'leader', 'leadership', 'led', 'manage', 'manager', 'management', 'project manager', 'pm', 'coordinate', 'coordinated'],
    answer: `Jholan was project manager of the four-member TopCraft capstone team (2025–2026): analyzing the client's requirements, coordinating development of the web and mobile system, and also developing features, UI components and testing.`,
    links: [link('topcraft')],
  });

  add({
    id: 'testing',
    title: 'Testing',
    keywords: ['test', 'tests', 'testing', 'qa', 'quality', 'debug', 'debugging', 'troubleshoot', 'troubleshooting', 'bugs'],
    answer: `Testing appears in each of Jholan's documented roles: functional testing on TopCraft and FemiSafe, and application testing, database connectivity testing and troubleshooting on VoiceLink Academy. VoiceLink's case study describes the project's automated test suites.`,
    links: [link('voicelink'), link('topcraft'), link('femisafe')],
  });

  add({
    id: 'ai',
    title: 'AI in the projects',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gemini', 'llm', 'model', 'classification', 'image classification', 'dataset', 'datasets'],
    answer: `• FoodWais: assesses meat and fish freshness with image classification; Jholan worked with the fish, pork, chicken and beef image datasets and helped design the app's workflow.\n• TopCraft: a team project whose AI-assisted features are tagged as generated by Google Gemini; Jholan's role was project manager, features, UI and testing.\n• VoiceLink Academy: optional Google Gemini features exist in the team's app and only run when an API key is configured.`,
    links: [link('foodwais'), link('topcraft'), link('voicelink')],
  });

  /* ------------------------------------------------------------ education */
  add({
    id: 'education',
    title: 'Education',
    keywords: ['education', 'school', 'university', 'college', 'degree', 'study', 'studying', 'course', 'bsit', 'information technology', 'nu', 'national university', 'graduate', 'graduation', 'year', 'senior high', 'specialization'],
    answer: list(education.map((e) => `${e.title}, ${e.place} (${e.when}). ${e.detail}.`)),
    links: [{ label: 'Education & achievements', href: '/#education' }],
  });

  add({
    id: 'honors',
    title: 'Academic honors and scholarship',
    keywords: ['honors', 'honours', 'honor', 'dean', "dean's", 'deans list', 'scholarship', 'scholar', 'awards', 'award', 'achievements', 'achievement', 'grades', 'academic'],
    answer: list(achievements.filter((a) => a.kind === 'Academic honor' || a.kind === 'Scholarship').map((a) => `${a.title}: ${a.detail}`)),
    links: [{ label: 'Education & achievements', href: '/#education' }],
  });

  add({
    id: 'certificates',
    title: 'Certificates',
    keywords: ['certificate', 'certificates', 'certification', 'certifications', 'certified', 'hackathon', 'seminar', 'conference', 'events', 'event', 'participation', 'training'],
    answer: `${certs.length} certificates, newest first:\n${list(certs.map((c) => `${c.data.title}: ${c.data.type}, ${c.data.issuer} (${c.data.dateLabel ?? c.data.date.getUTCFullYear()})`))}`,
    links: [{ label: 'Certificates section', href: '/#certificates' }],
  });

  /* -------------------------------------------------------------- contact */
  add({
    id: 'internship',
    title: 'Internship availability',
    keywords: ['internship', 'intern', 'interns', 'available', 'availability', 'hire', 'hiring', 'open to', 'looking for', 'opportunity', 'opportunities', 'job', 'ojt', 'recruit', 'recruiting'],
    answer: `Yes. Jholan is open to a software development internship. The quickest way to reach Jholan is email (${profile.email}) or LinkedIn; the CV is available as a PDF.`,
    links: [{ label: `Email ${profile.email}`, href: `mailto:${profile.email}` }, { label: 'LinkedIn', href: profile.linkedin }, { label: 'Résumé (PDF)', href: profile.resume }],
  });

  add({
    id: 'contact',
    title: 'Contact',
    keywords: ['contact', 'email', 'mail', 'reach', 'message', 'linkedin', 'github', 'connect', 'touch', 'get in touch', 'talk', 'socials'],
    answer: `• Email: ${profile.email}\n• LinkedIn: ${profile.linkedin.replace('https://www.', '')}\n• GitHub: ${profile.github.replace('https://', '')}`,
    links: [{ label: 'Send an email', href: `mailto:${profile.email}` }, { label: 'LinkedIn', href: profile.linkedin }, { label: 'GitHub', href: profile.github }, { label: 'Contact section', href: '/#contact' }],
  });

  add({
    id: 'resume',
    title: 'Résumé',
    keywords: ['resume', 'résumé', 'cv', 'curriculum vitae', 'download', 'pdf'],
    answer: `Jholan's CV is available as a PDF download.`,
    links: [{ label: 'Résumé (PDF)', href: profile.resume }],
  });

  add({
    id: 'github',
    title: 'Code and repositories',
    keywords: ['github', 'code', 'repository', 'repositories', 'repo', 'source', 'source code', 'open source'],
    answer: `Jholan's GitHub is ${profile.github.replace('https://', '')}. Public repositories linked from this site: VoiceLink Academy and this portfolio.`,
    links: [{ label: 'GitHub profile', href: profile.github }, ...P.voicelink.links, { label: 'Portfolio source', href: profile.portfolioRepo }],
  });

  add({
    id: 'interests',
    title: 'Interests',
    keywords: ['interests', 'interest', 'interested', 'passion', 'enjoy', 'like', 'focus', 'goals', 'goal', 'aspire', 'career'],
    answer: `Jholan's interests: ${joinAnd(profile.interests.map((i) => i.toLowerCase()))}.`,
    links: [{ label: 'About section', href: '/#about' }],
  });

  add({
    id: 'assistant',
    title: 'About this assistant',
    keywords: ['are you', 'who are you', 'what are you', 'bot', 'chatbot', 'assistant', 'ai assistant', 'real person', 'are you jholan', 'how do you work', 'how does this work'],
    answer: `I'm a search assistant for this portfolio, not Jholan and not an AI model. I match your question to a set of verified facts about Jholan's projects, skills, education, certificates and contact details, and link you to the relevant page. Nothing you type is sent anywhere.`,
  });

  return {
    version: 1,
    projectNames: {
      topcraft: ['topcraft', 'top craft', 'industrial manila', 'furniture'],
      voicelink: ['voicelink', 'voice link', 'voicelink academy', 'lms', 'call center', 'call-center'],
      femisafe: ['femisafe', 'femi safe', 'femi', 'safety app'],
      foodwais: ['foodwais', 'food wais', 'foodwise', 'food wise', 'freshness', 'palengke'],
    },
    entries,
  };
}
