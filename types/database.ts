export type TrustLevel = 'High' | 'Medium' | 'Low' | 'Uncertain';
export type Relationship = 'friend' | 'family' | 'colleague' | 'other';
export type LogCategory =
  | 'positive_trait'
  | 'negative_trait'
  | 'trust_event'
  | 'pattern'
  | 'one_off';

export interface Person {
  id: string;
  user_id: string;
  name: string;
  relationship: Relationship;
  avatar_color: string;
  trust_level: TrustLevel;
  trust_reason: string | null;
  character_summary: string | null;
  strengths: string[] | null;
  watchouts: string[] | null;
  positive_traits: string[] | null;
  negative_traits: string[] | null;
  created_at: string;
  updated_at: string;
  log_count?: number;
}

export interface Log {
  id: string;
  person_id: string;
  user_id: string;
  content: string;
  category: LogCategory;
  extracted_traits: {
    positive: string[];
    negative: string[];
  };
  created_at: string;
}

export interface Pattern {
  id: string;
  person_id: string;
  user_id: string;
  pattern_text: string;
  dismissed: boolean;
  created_at: string;
}

export interface PersonWithDetails extends Person {
  logs: Log[];
  patterns: Pattern[];
}
