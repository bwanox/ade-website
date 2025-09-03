import { BookOpen, Code, Shield, Zap } from 'lucide-react';

export type CourseModuleResource = {
  title: string;
  type: 'pdf' | 'link' | 'zip';
  url: string; // could be a storage URL later
  size?: string;
};

export type CourseModule = {
  id: string;
  title: string;
  summary: string;
  status?: 'locked' | 'in-progress' | 'validated';
  resources: {
    lesson?: CourseModuleResource | null;
    exercises?: CourseModuleResource[];
    pastExams?: CourseModuleResource[];
  };
};

export type CourseSemester = {
  id: string;
  title: string;
  modules: CourseModule[]; // always 6
};

export type Course = {
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  difficulty: string;
  duration: string;
  icon: any; // lucide icon component
  year: number;
  semesters: CourseSemester[]; // 2 semesters
  heroImage?: string;
};

const placeholderPdf = '/placeholder.pdf'; // TODO: replace with real storage paths

const makeModule = (n: number, base: string): CourseModule => ({
  id: `${base}-m${n}`,
  title: `Module ${n}`,
  summary: 'High-level overview of key concepts and competencies for this module.',
  status: 'in-progress',
  resources: {
    lesson: { title: `Module ${n} Lesson Notes`, type: 'pdf', url: placeholderPdf, size: '2.1MB' },
    exercises: [
      { title: `Exercises Set A`, type: 'pdf', url: placeholderPdf },
      { title: `Exercises Set B`, type: 'pdf', url: placeholderPdf },
    ],
    pastExams: [
      { title: 'Midterm 2023', type: 'pdf', url: placeholderPdf },
      { title: 'Final 2023', type: 'pdf', url: placeholderPdf },
    ],
  },
});

export const courses: Course[] = [
  {
    slug: 'cp1-foundations',
    title: 'CP1: Foundations of Programming',
    shortTitle: 'Foundations of Programming',
    description: 'Master the fundamentals of coding with hands-on projects and real-world examples.',
    difficulty: 'Beginner',
    duration: '8 weeks',
    icon: Code,
    year: 1,
    heroImage: 'https://picsum.photos/1200/600?random=11',
    semesters: [
      { id: 's1', title: 'Semester 1', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'cp1-s1')) },
      { id: 's2', title: 'Semester 2', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'cp1-s2')) },
    ],
  },
  {
    slug: 'cp2-advanced-data-structures',
    title: 'CP2: Advanced Data Structures',
    shortTitle: 'Advanced Data Structures',
    description: 'Dive deep into complex data structures and algorithms to solve challenging problems.',
    difficulty: 'Advanced',
    duration: '12 weeks',
    icon: Zap,
    year: 2,
    heroImage: 'https://picsum.photos/1200/600?random=12',
    semesters: [
      { id: 's1', title: 'Semester 1', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'cp2-s1')) },
      { id: 's2', title: 'Semester 2', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'cp2-s2')) },
    ],
  },
  {
    slug: 'software-engineering-principles',
    title: 'Software Engineering Principles',
    description: 'Learn the principles of building robust, scalable, and maintainable software systems.',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    icon: BookOpen,
    year: 2,
    heroImage: 'https://picsum.photos/1200/600?random=13',
    semesters: [
      { id: 's1', title: 'Semester 1', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'se-s1')) },
      { id: 's2', title: 'Semester 2', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'se-s2')) },
    ],
  },
  {
    slug: 'industrial-design-workshop',
    title: 'Industrial Design Workshop',
    description: 'From concept to prototype, explore the world of product design and innovation.',
    difficulty: 'Intermediate',
    duration: '6 weeks',
    icon: BookOpen,
    year: 2,
    heroImage: 'https://picsum.photos/1200/600?random=14',
    semesters: [
      { id: 's1', title: 'Semester 1', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'idw-s1')) },
      { id: 's2', title: 'Semester 2', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'idw-s2')) },
    ],
  },
  {
    slug: 'cybersecurity-defense',
    title: 'Cybersecurity Defense',
    description: 'Understand modern threats and learn to defend systems against cyber attacks.',
    difficulty: 'Advanced',
    duration: '14 weeks',
    icon: Shield,
    year: 3,
    heroImage: 'https://picsum.photos/1200/600?random=15',
    semesters: [
      { id: 's1', title: 'Semester 1', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'cyber-s1')) },
      { id: 's2', title: 'Semester 2', modules: Array.from({ length: 6 }, (_, i) => makeModule(i + 1, 'cyber-s2')) },
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find(c => c.slug === slug);
}
