export interface Project {
  id: string;
  name: string;
  description?: string;
  size?: string;
  location?: string;
  main_contractor?: string;
  technical_contractor?: string;
  progress: number;
  client?: string;
  address?: string;
  image_url?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  invited_by?: string;
  invitation_status: 'pending' | 'accepted' | 'rejected';
  invitation_email?: string;
  created_at: string;
  profile?: UserProfile;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by: string;
  created_at: string;
  expires_at: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface UserProfile {
  id: string;
  full_name: string;
  birth_date: string;
  company: string;
  job_title: string;
  email: string;
  city: string;
  avatar_url?: string;
  gender: 'male' | 'female';
  created_at: string;
} 