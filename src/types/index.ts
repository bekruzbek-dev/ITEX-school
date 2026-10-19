export type ApplicationStatus = "new" | "reviewing" | "accepted" | "rejected";
export type ComputerLevel = "boshlang'ich" | "o'rta" | "yuqori";

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  topics: string[];
  practice: string[];
  duration: string | null;
  schedule: string | null;
  icon: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Application {
  id: string;
  full_name: string;
  grade: string;
  school_name: string | null;
  phone: string;
  parent_phone: string | null;
  course_id: string | null;
  course_title: string | null;
  computer_level: ComputerLevel;
  comment: string | null;
  consent: boolean;
  status: ApplicationStatus;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  author: string;
  description: string;
  image_url: string | null;
  technologies: string[];
  project_date: string | null;
  demo_url: string | null;
  github_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  achievement_date: string | null;
  is_published: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  phone: string | null;
  email: string | null;
  telegram_url: string | null;
  address: string;
  map_embed_url: string | null;
}
