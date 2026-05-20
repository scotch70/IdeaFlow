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
    idea_round_manual_override: 'open' | 'closed' | null
    current_idea_round_id: string | null
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
    idea_round_manual_override?: 'open' | 'closed' | null
    current_idea_round_id?: string | null
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
    idea_round_manual_override?: 'open' | 'closed' | null
    current_idea_round_id?: string | null
  }
}

      idea_rounds: {
        Row: {
          id: string
          company_id: string
          name: string
          prompt: string | null
          status: 'draft' | 'active' | 'closed'
          created_at: string
          closed_at: string | null
          // added by multi-flow migration
          created_by: string | null
          starts_at: string | null
          ends_at: string | null
          manual_override: 'open' | 'closed' | null
          // added by icon-color migration
          icon: string | null   // emoji, e.g. '💡'
          color: string | null  // hex accent, e.g. '#f97316'
          // added by members-redesign migration
          audience_mode: 'workspace' | 'restricted'
          owner_id: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name?: string
          prompt?: string | null
          status?: 'draft' | 'active' | 'closed'
          created_at?: string
          closed_at?: string | null
          created_by?: string | null
          starts_at?: string | null
          ends_at?: string | null
          manual_override?: 'open' | 'closed' | null
          icon?: string | null
          color?: string | null
          audience_mode?: 'workspace' | 'restricted'
          owner_id?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          prompt?: string | null
          status?: 'draft' | 'active' | 'closed'
          created_at?: string
          closed_at?: string | null
          created_by?: string | null
          starts_at?: string | null
          ends_at?: string | null
          manual_override?: 'open' | 'closed' | null
          icon?: string | null
          color?: string | null
          audience_mode?: 'workspace' | 'restricted'
          owner_id?: string | null
        }
      }

      round_members: {
        Row: {
          id: string
          round_id: string
          user_id: string
          company_id: string
          added_by: string | null
          created_at: string
          // added by members-redesign migration
          role: 'owner' | 'admin' | 'member' | 'viewer'
          last_active_at: string | null
          invited_by: string | null
        }
        Insert: {
          id?: string
          round_id: string
          user_id: string
          company_id: string
          added_by?: string | null
          created_at?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          last_active_at?: string | null
          invited_by?: string | null
        }
        Update: {
          id?: string
          round_id?: string
          user_id?: string
          company_id?: string
          added_by?: string | null
          created_at?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          last_active_at?: string | null
          invited_by?: string | null
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
          // added by members-redesign migration
          last_active_at: string | null
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
          last_active_at?: string | null
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
          last_active_at?: string | null
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
          idea_round_id: string | null
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
          idea_round_id?: string | null
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
          idea_round_id?: string | null
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
          updated_at: string | null
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          company_id: string
          content: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          company_id?: string
          content?: string
          created_at?: string
          updated_at?: string | null
        }
      }

      idea_flow_reminders: {
        Row: {
          id:             string
          idea_round_id:  string
          reminder_type:  '7_days_before' | '1_day_before'
          sent_at:        string
        }
        Insert: {
          id?:            string
          idea_round_id:  string
          reminder_type:  '7_days_before' | '1_day_before'
          sent_at?:       string
        }
        Update: {
          id?:            string
          idea_round_id?: string
          reminder_type?: '7_days_before' | '1_day_before'
          sent_at?:       string
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
          /** When set, this is a flow-scoped invite — redeeming it adds the user to round_members. */
          idea_round_id: string | null
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
          idea_round_id?: string | null
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
          idea_round_id?: string | null
        }
      }
    }
  }
}

// ── Convenience aliases ───────────────────────────────────────────────────────

export type IdeaRound      = Database['public']['Tables']['idea_rounds']['Row']
export type RoundMember    = Database['public']['Tables']['round_members']['Row']

/** A round row with the effective open/closed/draft status pre-computed. */
export type IdeaRoundWithStatus = IdeaRound & {
  effectiveStatus: 'active' | 'closed' | 'draft'
  ideaCount: number
  memberCount: number
}

/** A profile slimmed down for member pickers / assignment lists. */
export type SlimProfile = {
  id: string
  full_name: string | null
  role: string
}

export type Idea = Database['public']['Tables']['ideas']['Row'] & {
  profiles?: { full_name: string | null }
  liked_by_user?: boolean
}

export type Invite = Database['public']['Tables']['invites']['Row']

export type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles?: { full_name: string | null }
}

// ── Members redesign ──────────────────────────────────────────────────────────

/** Per-flow role. 'member' is the default; the others are reserved for RBAC V2. */
export type FlowRole = 'owner' | 'admin' | 'member' | 'viewer'

/** Explicit audience scope for an IdeaFlow. */
export type AudienceMode = 'workspace' | 'restricted'

/** A flow as seen from one member's perspective on the Members page. */
export type FlowSummary = {
  id: string
  name: string
  status: 'draft' | 'active' | 'closed'
  /** When the user explicitly joined this flow. Null = workspace-inherited. */
  joinedAt: string | null
  /** Per-flow role from round_members, or null if access is workspace-inherited. */
  role: FlowRole | null
  audienceMode: AudienceMode
}

/** A workspace member with the set of flows they participate in. */
export type WorkspaceMemberWithFlows = {
  id: string
  fullName: string | null
  /** Workspace role: 'admin' | 'member'. */
  workspaceRole: string
  lastActiveAt: string | null
  /** Flows the user has access to. Empty array means orphaned/inactive. */
  flows: FlowSummary[]
}