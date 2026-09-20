export interface ContactInfo {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  other_links: string[];
}

export interface Skill {
  name: string;
  category?: string | null;
}

export interface Experience {
  company: string;
  title: string;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  bullets: string[];
  skills_used: string[];
}

export interface Education {
  institution: string;
  degree?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  gpa?: string | null;
  location?: string | null;
}

export interface Project {
  name: string;
  description?: string | null;
  role?: string | null;
  technologies: string[];
  link?: string | null;
  date?: string | null;
}

export interface CandidateProfile {
  contact: ContactInfo;
  summary?: string | null;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
  languages: string[];
}

export interface ExtractionWarning {
  field: string;
  message: string;
}

export interface ProfileExtractionResult {
  profile: CandidateProfile;
  warnings: ExtractionWarning[];
  source_filename: string;
  raw_text_length: number;
}

export interface CandidateProfileRow {
  id: string;
  user_id: string;
  source_filename: string;
  profile: CandidateProfile;
  warnings: ExtractionWarning[];
  raw_text_length: number;
  created_at: string;
  updated_at: string;
}

export interface JobListing {
  source: string;
  source_url: string;
  title: string;
  company?: string | null;
  location?: string | null;
  remote: boolean;
  salary_text?: string | null;
  posted_at?: string | null;
  description?: string | null;
}

export interface JobSearchRequest {
  job_title: string;
  location: string;
  remote_only: boolean;
  target_companies?: string;
}

export interface JobSearchResponse {
  listings: JobListing[];
  source_errors: string[];
}

export interface JobSearchPreferencesRow {
  id: string;
  user_id: string;
  job_title: string;
  location: string;
  remote_only: boolean;
  target_companies: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobListingRow extends JobListing {
  id: string;
  user_id: string;
  fetched_at: string;
  hidden: boolean;
}
