/**
 * Project Type Definitions
 */

export type ProjectType = 'game' | 'web' | 'api' | 'tool' | 'library';

export interface Project {
  id: number;
  title: string;
  description: string;
  type: ProjectType;
  url: string;
  embed_url: string;
  image_url: string;
  github_url: string;
  tech_stack: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProject {
  title: string;
  description?: string;
  type: ProjectType;
  url?: string;
  embed_url?: string;
  image_url?: string;
  github_url?: string;
  tech_stack?: string;
  user_id?: string;
}

export interface UpdateProject {
  id: number;
  title?: string;
  description?: string;
  type?: ProjectType;
  url?: string;
  embed_url?: string;
  image_url?: string;
  github_url?: string;
  tech_stack?: string;
}