import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Alessandro Marcolini",
  EMAIL: "alessandro@marcolini.dev",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 1,
  NUM_PROJECTS_ON_HOMEPAGE: 1,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Alessandro Marcolini's personal website.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects, with links to repositories and demos.",
};

export const ABOUT: Metadata = {
  TITLE: "About",
  DESCRIPTION: "A quick summary about me.",
};

export const SOCIALS: Socials = [
  { 
    NAME: "github",
    HREF: "https://github.com/alemar99"
  },
  { 
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/alessandro-marcolini",
  }
];
