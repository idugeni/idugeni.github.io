export interface ResumeData {
  downloadButton: string;
  header: {
    name: string;
    title: string;
    contact: string[];
    photo: string;
  };
  summary: string;
  experience: {
    position: string;
    company: string;
    period: string;
    responsibilities: string[];
    technologies: string[];
    achievements: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
    achievements: string[];
  }[];
  skills: {
    technical: {
      [key: string]: string[];
    };
    soft: string[];
  };
  languages: {
    name: string;
    level: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: string;
  }[];
}