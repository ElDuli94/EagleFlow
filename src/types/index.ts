// Brukerrelaterte typer
export interface UserProfile {
  id: string;
  full_name: string;
  birth_date: string;
  company: string;
  job_title: string;
  email: string;
  city: string;
  gender: 'male' | 'female';
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

// Prosjektrelaterte typer
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  invitation_status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  user_id: string;
  invited_by: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
}

// Toast-relaterte typer
export interface ToastMessage {
  title: string;
  description: string;
  status: 'success' | 'error' | 'warning' | 'info';
} 