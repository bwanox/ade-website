import { Bot, Cpu, HeartHandshake, Zap, Code, Palette } from 'lucide-react'

export interface ClubHighlight {
  title: string;
  description: string;
  icon?: string; // lucide icon name (optional for future use)
}

export interface ClubBoardMember {
  name: string;
  role: string;
  avatar?: string; // path or URL
  bio?: string;
  linkedin?: string;
}

export interface ClubEvent {
  date: string; // ISO or readable
  title: string;
  description: string;
  status?: 'upcoming' | 'past' | 'ongoing';
}

export interface ClubContact {
  email?: string;
  discord?: string;
  instagram?: string;
  x?: string;
  website?: string;
  joinForm?: string;
}

export interface ClubAchievement {
  title: string;
  description: string;
  image: string; // path to image asset
  year?: number;
  date?: string; // optional ISO for precise ordering
  highlight?: boolean; // for accent styling
}

export interface Club {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  icon: any; // Lucide icon component
  members: number;
  category: string;
  gradient: string; // tailwind gradient classes
  highlights: ClubHighlight[];
  board: ClubBoardMember[];
  events: ClubEvent[];
  contact: ClubContact;
  achievements?: ClubAchievement[];
}

export const clubs: Club[] = [
  {
    name: 'Robotics Club',
    slug: 'robotics-club',
    shortDescription: 'Build, code, and compete with cutting-edge robots.',
    longDescription: 'The Robotics Club is a collaborative hub for aspiring engineers, programmers, and innovators. We design, prototype, and build robots for competitions and internal showcases while exploring control systems, embedded programming, AI, and mechanical design. Whether you are a beginner or an experienced builder, you will find mentorship, hands-on workshops, and a supportive community.',
    icon: Bot,
    members: 120,
    category: 'Technology',
    gradient: 'from-blue-500 to-cyan-500',
    highlights: [
      { title: 'Weekly Build Nights', description: 'Hands-on sessions focused on mechanical assembly and prototyping.' },
      { title: 'Autonomous Systems', description: 'Experiment with perception, motion planning, and control algorithms.' },
      { title: 'National Competitions', description: 'Represent the university in robotics challenges.' },
    ],
    board: [
      { name: 'Amina K.', role: 'President', avatar: '/images/clubs/robotics/amina.jpg' },
      { name: 'Leo M.', role: 'VP Engineering', avatar: '/images/clubs/robotics/leo.jpg' },
      { name: 'Sarah T.', role: 'Operations Lead', avatar: '/images/clubs/robotics/sarah.jpg' },
      { name: 'Daniel R.', role: 'Software Lead', avatar: '/images/clubs/robotics/daniel.jpg' },
    ],
    events: [
      { date: '2025-09-15', title: 'Intro & Onboarding Night', description: 'Kickoff with overview of sub-teams and current projects.', status: 'upcoming' },
      { date: '2025-10-05', title: 'Sensor Integration Workshop', description: 'Hands-on with LiDAR, encoders, and IMUs.', status: 'upcoming' },
      { date: '2025-04-12', title: 'Spring Robotics Showcase', description: 'Demo autonomous rover and manipulator arm.', status: 'past' },
    ],
    contact: { email: 'robotics@campus.edu', discord: 'https://discord.gg/robotics', instagram: 'https://instagram.com/robotics', joinForm: '#' },
    achievements: [
      {
        title: 'National Robotics Challenge Finalists',
        description: 'Placed 2nd nationally with an autonomous vision-guided rover.',
        image: '/images/clubs/robotics/achievements/national-finalists.jpg',
        year: 2024,
        highlight: true,
      },
      {
        title: 'Best Mechanical Design Award',
        description: 'Recognized for modular arm actuator system.',
        image: '/images/clubs/robotics/achievements/mech-design.jpg',
        year: 2023,
      },
      {
        title: 'Autonomous Navigation Milestone',
        description: 'Achieved sub-5cm localization accuracy indoors.',
        image: '/images/clubs/robotics/achievements/navigation.jpg',
        year: 2025,
      },
    ],
  },
  {
    name: 'Electronics Club',
    slug: 'electronics-club',
    shortDescription: 'Tinker with circuits, microcontrollers, and create amazing gadgets.',
    longDescription: 'We explore analog and digital electronics through project-based learning. From PCB design and soldering to embedded firmware and IoT systems, the Electronics Club empowers students to go from concept to functional hardware.',
    icon: Cpu,
    members: 85,
    category: 'Engineering',
    gradient: 'from-green-500 to-emerald-500',
    highlights: [
      { title: 'PCB Design Labs', description: 'Learn KiCad and rapid prototyping best practices.' },
      { title: 'Firmware Nights', description: 'STM32, ESP32, and Arduino programming sessions.' },
      { title: 'Hardware Library', description: 'Shared inventory of components and dev boards.' },
    ],
    board: [
      { name: 'Noura A.', role: 'President' },
      { name: 'Ibrahim H.', role: 'Lab Manager' },
      { name: 'Maya S.', role: 'Education Lead' },
    ],
    events: [
      { date: '2025-09-20', title: 'Soldering 101', description: 'Intro workshop for new members.', status: 'upcoming' },
      { date: '2025-11-02', title: 'IoT Hack Evening', description: 'Prototype connected devices.', status: 'upcoming' },
    ],
    contact: { email: 'electronics@campus.edu', discord: '#', joinForm: '#' },
    achievements: [
      {
        title: 'Campus Energy Monitor Network',
        description: 'Deployed low-power sensors tracking lab energy usage.',
        image: '/images/clubs/electronics/achievements/energy-monitor.jpg',
        year: 2025,
        highlight: true,
      },
      {
        title: 'Open-Source PCB Library',
        description: 'Released reusable footprints & templates for students.',
        image: '/images/clubs/electronics/achievements/pcb-library.jpg',
        year: 2024,
      },
    ],
  },
  {
    name: 'Humanitarian Club',
    slug: 'humanitarian-club',
    shortDescription: 'Make a difference through volunteering and social projects.',
    longDescription: 'Dedicated to community impact, the Humanitarian Club organizes outreach initiatives, awareness campaigns, and collaborations with NGOs. We believe in empowering students to create sustainable change locally and globally.',
    icon: HeartHandshake,
    members: 200,
    category: 'Social Impact',
    gradient: 'from-pink-500 to-rose-500',
    highlights: [
      { title: 'Monthly Service Projects', description: 'Education, health, and environmental initiatives.' },
      { title: 'Impact Incubator', description: 'Support student-led social innovation projects.' },
      { title: 'Partnership Network', description: 'Collaborations with 10+ NGOs.' },
    ],
    board: [
      { name: 'Layla B.', role: 'President' },
      { name: 'Omar F.', role: 'Outreach Lead' },
      { name: 'Rim E.', role: 'Programs Coordinator' },
    ],
    events: [
      { date: '2025-09-10', title: 'Volunteer Fair', description: 'Meet partner organizations.', status: 'upcoming' },
      { date: '2025-12-05', title: 'Winter Donation Drive', description: 'Collect essentials for families.', status: 'upcoming' },
    ],
    contact: { email: 'humanitarian@campus.edu', instagram: '#', joinForm: '#' },
    achievements: [
      {
        title: 'Winter Essentials Drive',
        description: 'Collected & distributed 800+ care packages.',
        image: '/images/clubs/humanitarian/achievements/winter-drive.jpg',
        year: 2024,
        highlight: true,
      },
      {
        title: 'Community Literacy Program',
        description: 'Launched weekend tutoring reaching 60+ students.',
        image: '/images/clubs/humanitarian/achievements/literacy.jpg',
        year: 2025,
      },
    ],
  },
  {
    name: 'AI Society',
    slug: 'ai-society',
    shortDescription: 'Explore the frontiers of AI and machine learning.',
    longDescription: 'From deep learning study groups to applied AI hack nights, the AI Society brings together enthusiasts of all skill levels. We demystify complex topics and build impactful AI-driven tools.',
    icon: Zap,
    members: 150,
    category: 'Technology',
    gradient: 'from-purple-500 to-violet-500',
    highlights: [
      { title: 'Weekly Study Pods', description: 'Paper reading + architecture deep dives.' },
      { title: 'Model Deployment', description: 'Workshops on edge and cloud inference.' },
      { title: 'Industry Speakers', description: 'Talks from researchers & founders.' },
    ],
    board: [
      { name: 'Karim Z.', role: 'President' },
      { name: 'Sara M.', role: 'Research Lead' },
      { name: 'Othman R.', role: 'Projects Lead' },
    ],
    events: [
      { date: '2025-09-18', title: 'Intro to Applied AI', description: 'Kickoff session + roadmap.', status: 'upcoming' },
      { date: '2025-11-12', title: 'LLM Mini-Hack', description: 'Rapid prototyping with open models.', status: 'upcoming' },
    ],
    contact: { email: 'ai@campus.edu', discord: '#', joinForm: '#' },
    achievements: [
      {
        title: 'LLM Campus Assistant Prototype',
        description: 'Built a retrieval-augmented study helper for courses.',
        image: '/images/clubs/ai/achievements/llm-assistant.jpg',
        year: 2025,
        highlight: true,
      },
      {
        title: 'Paper Reading Marathon',
        description: 'Completed 20 seminal deep learning papers in 6 weeks.',
        image: '/images/clubs/ai/achievements/paper-marathon.jpg',
        year: 2024,
      },
    ],
  },
  {
    name: 'Hardware Hackers',
    slug: 'hardware-hackers',
    shortDescription: 'From IoT to custom keyboards, if it\'s hardware, we love it.',
    longDescription: 'A playground for experimental hardware: keyboards, wearables, robotics peripherals, IoT gadgets, and more. Rapid iteration, shared tooling, and community learning fuel what we build.',
    icon: Code,
    members: 90,
    category: 'Innovation',
    gradient: 'from-orange-500 to-amber-500',
    highlights: [
      { title: 'Hack Nights', description: 'Collaborative build & debug sessions.' },
      { title: 'Custom PCB Sprint', description: 'Design + fab challenge.' },
      { title: 'Tooling Access', description: 'Logic analyzers, microscopes, printers.' },
    ],
    board: [
      { name: 'Selim P.', role: 'Coordinator' },
      { name: 'Ines L.', role: 'Fabrication Lead' },
      { name: 'Youssef B.', role: 'Firmware Lead' },
    ],
    events: [
      { date: '2025-09-25', title: 'Open Lab Night', description: 'Tour & mini projects.', status: 'upcoming' },
      { date: '2025-10-22', title: 'Keyboard Build Session', description: 'Assemble & flash custom boards.', status: 'upcoming' },
    ],
    contact: { email: 'hardware@campus.edu', discord: '#', joinForm: '#' },
    achievements: [
      {
        title: 'Custom Mechanical Keyboard Run',
        description: 'Designed & assembled 30 hotswap boards.',
        image: '/images/clubs/hardware/achievements/keyboards.jpg',
        year: 2025,
        highlight: true,
      },
      {
        title: 'Wearable Sensor Prototype',
        description: 'Flexible PCB for motion tracking experiments.',
        image: '/images/clubs/hardware/achievements/wearable.jpg',
        year: 2024,
      },
    ],
  },
  {
    name: 'Design Collective',
    slug: 'design-collective',
    shortDescription: 'UI/UX, graphic design, and digital art.',
    longDescription: 'The Design Collective blends aesthetics with problem-solving. We host critiques, portfolio labs, and interdisciplinary collabs with dev & product clubs to ship polished experiences.',
    icon: Palette,
    members: 110,
    category: 'Creative',
    gradient: 'from-indigo-500 to-blue-500',
    highlights: [
      { title: 'Critique Circles', description: 'Iterate on real product flows.' },
      { title: 'Figma Power Sessions', description: 'Advanced prototyping & systems.' },
      { title: 'Brand Labs', description: 'Identity + visual experimentation.' },
    ],
    board: [
      { name: 'Jana E.', role: 'Lead Designer' },
      { name: 'Mehdi O.', role: 'Experience Architect' },
      { name: 'Yara G.', role: 'Community Lead' },
    ],
    events: [
      { date: '2025-09-12', title: 'Design Systems 101', description: 'Intro + component tokens.', status: 'upcoming' },
      { date: '2025-10-30', title: 'Portfolio Review Night', description: 'Get feedback from peers.', status: 'upcoming' },
    ],
    contact: { email: 'design@campus.edu', instagram: '#', joinForm: '#' },
    achievements: [
      {
        title: 'Interdisciplinary Product Sprint',
        description: 'Shipped 5 prototype apps with dev & AI teams.',
        image: '/images/clubs/design/achievements/product-sprint.jpg',
        year: 2025,
        highlight: true,
      },
      {
        title: 'Portfolio Night Success',
        description: 'Helped 15 members land internships after reviews.',
        image: '/images/clubs/design/achievements/portfolio-night.jpg',
        year: 2024,
      },
    ],
  },
]

export function getClubBySlug(slug: string): Club | undefined {
  return clubs.find(c => c.slug === slug)
}
