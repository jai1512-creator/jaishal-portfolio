export const EMAIL = 'jaishaljoshi2004@gmail.com';
export const RESUME = './resume.pdf';
// Put your photo at public/portrait.png (transparent PNG looks best)
export const PORTRAIT = './portrait.png';
export const HERO_PORTRAIT = './portrait-bw.png';
export const HERO_SIGNATURE = './signature.png';

// Interest cards (public/interests/*.jpg). `pos` is the object-position used to crop each picture into the wide card.
export const INTERESTS = [
  { title: 'Music', src: './pictures/interests/music.jpg', pos: '50% 50%' },
  { title: 'Technology', src: './pictures/interests/technology.jpg', pos: '50% 35%' },
  { title: 'Photography', src: './pictures/interests/photography.jpg', pos: '50% 50%' },
  { title: 'Visual Design', src: './pictures/interests/visual design.jpg', pos: '50% 50%' },
  { title: 'Fashion & Modelling', src: './pictures/interests/FASHION POSTER.jpg', pos: '50% 30%' },
  { title: 'Gaming', src: './pictures/interests/Gamer.jpg', pos: '50% 42%' },
  { title: 'Cinema', src: './pictures/interests/cinema.jpg', pos: '50% 35%' },
  { title: 'Exploring & Discovery', src: './pictures/interests/explore.jpg', pos: '50% 60%' },
];

export const ABOUT_IMAGES = [
  { src: './about/moon_icon.png', cls: 'w-[120px] sm:w-[160px] md:w-[210px] top-[4%] left-[1%] sm:left-[2%] md:left-[4%]', delay: 0.1, x: -80 },
  { src: './about/p59_1.png', cls: 'w-[100px] sm:w-[140px] md:w-[180px] bottom-[5%] left-[2%] sm:left-[4%] md:left-[6%]', delay: 0.25, x: -80 },
  { src: './about/lego_icon.png', cls: 'w-[120px] sm:w-[160px] md:w-[210px] top-[4%] right-[1%] sm:right-[2%] md:right-[4%]', delay: 0.15, x: 80 },
  { src: './about/group_134.png', cls: 'w-[130px] sm:w-[170px] md:w-[220px] bottom-[5%] right-[2%] sm:right-[4%] md:right-[6%]', delay: 0.3, x: 80 },
];

export type ServiceItem = {
  name: string;
  desc: string;
  tags: string[];
};

export const SERVICES: ServiceItem[] = [
  {
    name: 'Frontend Development',
    desc: 'Responsive, fast interfaces built with React, TypeScript, Vite and Tailwind CSS, with attention to layout, typography and motion.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  },
  {
    name: 'Full-Stack Web Apps',
    desc: 'End-to-end products with Flask and SQLite backends, CRUD flows and clean APIs connecting the UI to real data.',
    tags: ['Flask', 'SQLite', 'Python', 'REST APIs'],
  },
  {
    name: 'AI-Powered Products',
    desc: 'Apps that integrate AI image-generation APIs to turn user input into personalized, visual results.',
    tags: ['Python', 'APIs', 'Prompt Engineering', 'AI Tools'],
  },
  {
    name: 'IoT & Embedded Systems',
    desc: 'Sensor-driven prototypes with ESP32 and Arduino: real-time monitoring, smartphone alerts and automated control.',
    tags: ['ESP32', 'Arduino', 'Sensors', 'IoT'],
  },
  {
    name: 'Deployment & Hosting',
    desc: 'Shipping live on Vercel, Render and GitHub Pages, with Git/GitHub workflows and public URLs from day one.',
    tags: ['Vercel', 'Render', 'GitHub Pages', 'Git'],
  },
];

export type Project = {
  name: string;
  category: string;
  url: string;
  images: string[];
  description?: string;
  features?: string[];
  tech?: string[];
  repo?: string;
};

export const PROJECTS: Project[] = [
  {
    name: 'Roomify',
    category: 'AI · React + Flask',
    url: 'https://roomify-jgal.onrender.com/',
    description: 'An AI room-makeover web app. Upload a photo of your room, choose the room type, style, mood, colour palette, budget and lighting, and get an AI-redesigned image of the space.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Flask', 'Python', 'SQLite', 'AI image generation API', 'GitHub', 'Render'],
    images: [
      './projects/roomify-design-interface.jpg',
      './projects/roomify-interior-showcase.jpg',
      './projects/roomify-landing-page.jpg',
    ],
  },
  {
    name: 'WeatherWise',
    category: 'Weather App · React + Three.js',
    url: 'https://jai1512-creator.github.io/weatherwise/',
    description: 'An interactive 3D weather forecasting web application with dynamic atmospheric visualizations, real-time location exploration, and detailed meteorological metrics.',
    tech: ['React', 'Three.js', 'TypeScript', 'Tailwind CSS', 'OpenWeather API', 'Vite', 'GitHub Pages'],
    images: [
      './projects/weatherwise-location-explorer.jpg',
      './projects/weatherwise-weather-forecast.jpg',
      './projects/weatherwise-main-preview.jpg',
    ],
  },
  {
    name: "What's In My Fridge?",
    category: 'Web App · React + TS',
    url: 'https://jai1512-creator.github.io/whats-in-my-fridge/',
    description: 'A responsive recipe-discovery website that helps people find meals they can make with the ingredients they already have at home.',
    tech: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Vite', 'GitHub Pages'],
    images: [
      './projects/fridge-recipe-discovery.jpg',
      './projects/fridge-recipe-details.jpg',
      './projects/fridge-landing-page.jpg',
    ],
  },
  {
    name: 'Baithak',
    category: 'Music App · Vanilla JS',
    url: 'https://baithak-phi.vercel.app/',
    description: 'A clean and responsive music player and playlist discovery web app featuring smooth audio streaming, curated playlists, and custom audio controls.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    images: [
      './projects/baithak-playlist-discovery.jpg',
      './projects/baithak-music-player.jpg',
      './projects/baithak-landing-page.jpg',
    ],
  },
  {
    name: 'JobTrack',
    category: 'Full-Stack · Flask + SQLite',
    url: 'https://jobtrack-8gxw.onrender.com',
    description: 'A full-stack job application tracker with complete create, read, update and delete (CRUD) management of every application.',
    features: ['Company and role', 'Application date and location', 'Salary', 'Application status', 'Interview date', 'Notes'],
    tech: ['HTML', 'CSS', 'JavaScript', 'Python', 'Flask', 'SQLite'],
    images: [
      './projects/jobtrack-dashboard.jpg',
      './projects/jobtrack-application-management.jpg',
      './projects/jobtrack-landing-page.jpg',
    ],
  },
  {
    name: 'SceneSwap',
    category: 'Interactive Platform · React + Vite',
    url: 'https://jai1512-creator.github.io/sceneswap/',
    repo: 'https://github.com/jai1512-creator/sceneswap',
    description:
      'An editorial discovery engine that breaks iconic visual worlds into structured aesthetic recipes: colour harmony, lighting, soundscapes and wardrobe. 11 curated film worlds, procedural ambient audio built with the Web Audio API, and a hybrid remixer that blends two scenes into a new one.',
    features: [
      '11 Curated Film Worlds (Cyberpunk, Dark Academia, Bollywood Retro, 80s Neon...)',
      '01–07 Aesthetic Breakdown: Color palettes, typography specimens, Kelvin lighting',
      'Web Audio Synthesis: Procedural ambient drones and soundscapes with live frequency visualizer',
      'Hybrid Remixer & Studio Builder: Blend two scenes into intentional hybrid aesthetic worlds',
    ],
    tech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Web Audio API', 'Vite', 'GitHub Pages'],
    images: [
      './projects/sceneswap.webp',
      './projects/sceneswap-og.png',
      './projects/sceneswap.png',
    ],
  },
];

// Curated project selection displayed on the main portfolio homepage
export const HOMEPAGE_PROJECTS: Project[] = PROJECTS.filter(
  (p) => p.name !== 'JobTrack' && p.name !== 'SceneSwap'
);

// Background collage cutouts (public/collage/<name>.webp), rendered behind the hero content
export const DECO = ['pen', 'lens', 'camera', 'magnifier', 'megaphone', 'rocket', 'typewriter', 'globe'];

// ---- About section tabs ----
export const ABOUT_INTRO = "I'm an Electronics and Communication Engineering graduate interested in web development, UI/UX, and visual creativity, who enjoys turning ideas into polished digital products.";
export const ABOUT_TABS = ['Interests', 'Education', 'Gallery', 'Skills', 'Experience'] as const;

export type ExperienceItem = {
  type: string;
  role: string;
  period: string;
  badge?: string;
  description: string;
  highlights: string[];
  skills: string[];
};

export const EXPERIENCE_PITCH = {
  badge: 'Fresher · Open to Opportunities',
  headline: 'Hire Me, Get Two.',
  punchline: 'A developer who gets the job done and a teammate who makes the day better.',
  supportingCopy:
    "I'm a fresher, so I won't pretend to have years of corporate experience. What I do bring is curiosity, creative thinking, a willingness to learn, and the habit of turning ideas into working projects. I'll bring the code, the commitment, and probably a terrible joke or two.",
  highlights: [
    {
      title: 'The Employee',
      desc: 'Ready to learn, build, solve problems, and take ownership.',
      tag: '01 / Ownership',
    },
    {
      title: 'The Teammate',
      desc: 'Easy to work with, happy to share ideas, and always up for helping the team.',
      tag: '02 / Culture',
    },
    {
      title: 'The Bonus',
      desc: 'Creative energy, a positive attitude, and occasional dad-level jokes.',
      tag: '03 / Vibe',
    },
  ],
  toolkit: ['React', 'TypeScript', 'Tailwind CSS', 'Flask', 'REST APIs', 'SQLite', 'Git & GitHub', 'ESP32 / IoT'],
};

export const EXPERIENCE: ExperienceItem[] = [
  {
    type: 'Personal Projects & Hands-On Practice',
    role: 'Independent Web Developer & Builder',
    period: '2023 – Present',
    badge: 'Fresher · Personal Projects',
    description:
      'Designing and developing end-to-end web applications with a focus on responsive UI/UX, clean code architecture, modern component libraries, and practical IoT integrations. Built through self-directed hands-on projects to develop full-stack engineering proficiency.',
    highlights: [
      'Developed and deployed full-featured web applications including Roomify (AI interior styling), WeatherWise (interactive 3D weather app), and JobTrack (application management system).',
      'Engineered responsive frontend interfaces using React, TypeScript, Tailwind CSS, and Framer Motion with attention to design systems, typography, and accessibility.',
      'Constructed backend services and REST APIs with Flask and SQLite, integrating external image-generation and weather services.',
      'Prototyped IoT hardware monitoring systems using ESP32 and Arduino microcontrollers with automated alerts.',
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Flask', 'REST APIs', 'SQLite', 'Git & GitHub', 'IoT / ESP32'],
  },
];

export const ABOUT_FACTS: [string, string][] = [
  ['Name', 'Jaishal Joshi'],
  ['Based in', 'Kolkata, India'],
  ['Degree', 'B.Tech, Electronics & Communication Engineering'],
  ['Works with', 'React, TypeScript, Flask, ESP32 & Arduino'],
  ['Email', EMAIL],
];

export type AcademicStage = {
  num: string;
  stageName: string;
  institution: string;
  level: string;
  degree?: string;
  cgpa?: string;
  percentage?: string;
  scoreTag?: string;
  image: string;
  alt: string;
  caption: string;
};

export const EDUCATION = {
  degree: 'B.Tech in Electronics and Communication Engineering',
  university: 'Maulana Abul Kalam Azad University of Technology (MAKAUT)',
  cgpa: '6.85',
  stages: [
    {
      num: '01',
      stageName: 'Primary & Secondary Education',
      institution: 'Gospel Home School',
      level: 'CLASSES 1–10',
      percentage: '88%',
      scoreTag: 'Class 10',
      image: './pictures/education/gospel-home-school.jpg',
      alt: 'Gospel Home School campus building and entrance',
      caption: 'Gospel Home School',
    },
    {
      num: '02',
      stageName: 'Higher Secondary Education',
      institution: 'TIGPS',
      level: 'CLASSES 11–12',
      percentage: '77%',
      scoreTag: 'Class 12',
      image: './pictures/education/tigps.jpg',
      alt: 'TIGPS campus building and grounds',
      caption: 'TIGPS',
    },
    {
      num: '03',
      stageName: 'Undergraduate Education',
      institution: 'Maulana Abul Kalam Azad University of Technology (MAKAUT)',
      degree: 'B.Tech in Electronics and Communication Engineering',
      level: 'Undergraduate Degree',
      cgpa: '6.85',
      image: './pictures/education/makaut.avif',
      alt: 'Maulana Abul Kalam Azad University of Technology (MAKAUT) campus',
      caption: 'MAKAUT Campus',
    },
  ] as AcademicStage[],
  memories: [
    {
      title: 'Campus Moments',
      src: './pictures/college/campus.jpg',
      alt: 'Campus memories with peers',
    },
    {
      title: 'Batch & Classmates',
      src: './pictures/college/batch.jpg',
      alt: 'College classmates and batch gathering',
    },
  ],
  photos: [
    {
      title: 'Campus Memories',
      caption: 'Campus memories',
      src: './pictures/college/campus.jpg',
      alt: 'Campus memories',
    },
    {
      title: 'College Building',
      caption: 'College building',
      src: './pictures/college/college.avif',
      alt: 'College building',
    },
    {
      title: 'Batch & Classmates',
      caption: 'Batch and classmates',
      src: './pictures/college/batch.jpg',
      alt: 'Batch and classmates',
    },
  ],
};

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  label?: string;
};

export const GALLERY: GalleryItem[] = [
  {
    id: 'g-01',
    src: './pictures/gallery/_MG_0057.JPG',
    alt: 'Certificate presentation ceremony',
    label: 'Award Presentation',
  },
  {
    id: 'g-02',
    src: './pictures/gallery/IMG_20260713_180834.jpg',
    alt: 'B.Tech project report portrait',
    label: 'Project Submission',
  },
  {
    id: 'g-03',
    src: './pictures/gallery/IMG_20260716_144815.jpg',
    alt: 'Campus grounds portrait',
    label: 'Campus Grounds',
  },
  {
    id: 'g-04',
    src: './pictures/gallery/IMG_20260716_151404.jpg',
    alt: 'Campus memories with friends',
    label: 'College Memories',
  },
  {
    id: 'g-05',
    src: './pictures/gallery/1694177145628.jpg',
    alt: 'Auditorium cohort gathering',
    label: 'Auditorium Cohort',
  },
  {
    id: 'g-06',
    src: './pictures/gallery/IMG-20230627-WA0026.jpg',
    alt: 'Campus gathering with friends',
    label: 'Campus Gathering',
  },
  {
    id: 'g-07',
    src: './pictures/gallery/IMG_20260607_020101.jpg',
    alt: 'Live concert and event atmosphere',
    label: 'Concert & Lights',
  },
  {
    id: 'g-08',
    src: './pictures/gallery/IMG_20220317_174517.jpg',
    alt: 'Moments with peers',
    label: 'Moments with Peers',
  },
  {
    id: 'g-09',
    src: './pictures/gallery/campus.jpg',
    alt: 'Campus lawn moments',
    label: 'Campus Moments',
  },
  {
    id: 'g-10',
    src: './pictures/gallery/batch.jpg',
    alt: 'Classmates and batch photograph',
    label: 'Batch & Classmates',
  },
];

// Taken from the services, projects and tooling already listed on this site.
export const SKILLS = [
  { group: 'Frontend', items: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Vanilla JavaScript'] },
  { group: 'Backend & Data', items: ['Flask', 'SQLite', 'REST APIs', 'AI image-generation APIs'] },
  { group: 'IoT & Embedded', items: ['ESP32', 'Arduino', 'Sensor monitoring', 'Smartphone alerts'] },
  { group: 'Tools & Deployment', items: ['Git & GitHub', 'Vercel', 'Render', 'GitHub Pages'] },
];
