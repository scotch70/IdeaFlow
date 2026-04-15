export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
  Row: {
    id: string
    name: string
    created_at: string
    plan: string
    trial_ends_at: string | null
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    custom_idea_prompt: string | null
    idea_round_name: string | null
    idea_round_status: 'draft' | 'active' | 'closed' | null
    idea_round_starts_at: string | null
    idea_round_ends_at: string | null
  }
  Insert: {
    id?: string
    name: string
    created_at?: string
    plan?: string
    trial_ends_at?: string | null
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    custom_idea_prompt?: string | null
    idea_round_name?: string | null
    idea_round_status?: 'draft' | 'active' | 'closed' | null
    idea_round_starts_at?: string | null
    idea_round_ends_at?: string | null
  }
  Update: {
    id?: string
    name?: string
    created_at?: string
    plan?: string
    trial_ends_at?: string | null
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    custom_idea_prompt?: string | null
    idea_round_name?: string | null
    idea_round_status?: 'draft' | 'active' | 'closed' | null
    idea_round_starts_at?: string | null
    idea_round_ends_at?: string | null
  }
}

      profiles: {
        Row: {
          id: string
          company_id: string | null
          full_name: string | null
          last_name: string | null
          job_function: string | null
          avatar_url: string | null
          created_at: string
          role: string
        }
        Insert: {
          id: string
          company_id?: string | null
          full_name?: string | null
          last_name?: string | null
          job_function?: string | null
          avatar_url?: string | null
          created_at?: string
          role?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          full_name?: string | null
          last_name?: string | null
          job_function?: string | null
          avatar_url?: string | null
          created_at?: string
          role?: string
        }
      }

      ideas: {
        Row: {
          id: string
          user_id: string
          company_id: string
          title: string
          description: string | null
          likes_count: number
          created_at: string
          status: string
          status_note: string | null
          status_changed_at: string | null
          status_changed_by: string | null
          impact_summary: string | null
          impact_type: string | null
          impact_link: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          title: string
          description?: string | null
          likes_count?: number
          created_at?: string
          status?: string
          status_note?: string | null
          status_changed_at?: string | null
          status_changed_by?: string | null
          impact_summary?: string | null
          impact_type?: string | null
          impact_link?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          title?: string
          description?: string | null
          likes_count?: number
          created_at?: string
          status?: string
          status_note?: string | null
          status_changed_at?: string | null
          status_changed_by?: string | null
          impact_summary?: string | null
          impact_type?: string | null
          impact_link?: string | null
        }
      }

      likes: {
        Row: {
          id: string
          user_id: string
          idea_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string
          created_at?: string
        }
      }

      comments: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          company_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          company_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          company_id?: string
          content?: string
          created_at?: string
        }
      }

      invites: {
        Row: {
          id: string
          company_id: string
          created_by: string
          email: string | null
          invite_code: string
          role: string
          used_at: string | null
          expires_at: string | null
          created_at: string
          name: string | null
          joined_user_id: string | null
        }
        Insert: {
          id?: string
          company_id: string
          created_by: string
          email?: string | null
          invite_code: string
          role?: string
          used_at?: string | null
          expires_at?: string | null
          created_at?: string
          name?: string | null
          joined_user_id?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          created_by?: string
          email?: string | null
          invite_code?: string
          role?: string
          used_at?: string | null
          expires_at?: string | null
          created_at?: string
          name?: string | null
          joined_user_id?: string | null
        }
      }
    }
  }
}

export type Idea = Database['public']['Tables']['ideas']['Row'] & {
  profiles?: { full_name: string | null }
  liked_by_user?: boolean
}

export type Invite = Database['public']['Tables']['invites']['Row']

export type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles?: { full_name: string | null }
}