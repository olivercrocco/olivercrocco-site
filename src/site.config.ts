/**
 * Single source of truth for site-wide info.
 * Edit here once and it propagates everywhere.
 */

export const SITE = {
  name: "Oliver S. Crocco",
  shortName: "Ozzie Crocco",
  url: "https://olivercrocco.com",
  description:
    "Associate Professor of Leadership and Human Resource Development at Louisiana State University. Research at the intersection of leadership, learning, and human development — across Southeast Asia, organizations, and the lives of learners.",
  positioning:
    "I research human development, global leadership, and the changing nature of work, with deep work in Southeast Asia.",
} as const;

export const AUTHOR = {
  name: "Oliver S. Crocco",
  nickname: "Ozzie",
  fullTitle: "Oliver S. (Ozzie) Crocco, EdD",
  role: "Associate Professor of Leadership and Human Resource Development",
  scholarlyArea: "Leadership, learning, & human development",
  department: "School of Leadership & Human Resource Development",
  institution: "Louisiana State University",
  visitingRole: "Visiting Professor",
  visitingInstitution: "Chulalongkorn University, Bangkok",
  email: "olivercrocco@lsu.edu",
  namedropUrl: "https://namedrop.io/olivercrocco",
  lsuProfileUrl:
    "https://www.lsu.edu/chse/slhrd/about/bios/crocco.php",
} as const;

export const SOCIAL = {
  twitter: "https://twitter.com/OzzieCrocco",
  linkedin: "https://www.linkedin.com/in/olivercrocco/",
  googleScholar:
    "https://scholar.google.com/citations?user=7LcwHvIAAAAJ&hl=en",
  orcid: "https://orcid.org/0000-0001-8472-1224",
} as const;

export const NAV = [
  { label: "About", href: "/about" },
  { label: "Books", href: "/books" },
  { label: "Publications", href: "/publications" },
  { label: "Speaking", href: "/speaking" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Research themes — used on homepage and About page.
 * Pulled from Ozzie's About bio + memory.
 */
export const RESEARCH_THEMES = [
  {
    title: "Building Human Capability in Southeast Asia",
    summary:
      "Comparative work across the ASEAN 11 on how nations build human capability — through institutions, education systems, leadership, and culture. The regional context generates dynamics that single-country research and Western frameworks regularly miss.",
    icon: "asia",
  },
  {
    title: "Global Leadership & Adult Learning",
    summary:
      "Leadership development and adult learning as developmental, transformative processes — especially in complex cross-cultural settings and in service of paradox, ambiguity, and change.",
    icon: "globe",
  },
  {
    title: "The Changing Nature of Work",
    summary:
      "Workplace learning under digitalization, remote and hybrid work, and emerging employment arrangements — including gig economies, AI-augmented work, and what it means to develop a worker now.",
    icon: "circuit",
  },
] as const;
