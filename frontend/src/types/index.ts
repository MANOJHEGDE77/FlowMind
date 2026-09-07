export interface User {
  id: number;
  email: string;
  full_name?: string;
  preferences?: Record<string, any>;
}

export interface DecisionOption {
  id: number;
  decision_id: number;
  title: string;
  description?: string;
  pros: string[];
  cons: string[];
  score: number;
  alignment_scores: Record<string, number>;
  is_recommended: boolean;
}

export interface DecisionFactor {
  id: number;
  name: string;
  category: string;
  weight: number;
  description?: string;
}

export interface Goal {
  id: number;
  description: string;
  priority: string;
  weight: number;
}

export interface Constraint {
  id: number;
  description: string;
  severity: string;
}

export interface EvidenceItem {
  id: number;
  decision_id: number;
  claim: string;
  source_document_id?: number;
  source_title: string;
  page_or_section?: string;
  quote: string;
  relevance_explanation: string;
  agent_name: string;
}

export interface AgentRun {
  id: number;
  decision_id: number;
  agent_name: string;
  agent_role: string;
  status: string;
  viewpoint: string;
  findings: Record<string, any>;
  confidence: number;
  duration_ms: number;
  created_at: string;
}

export interface Decision {
  id: number;
  user_id: number;
  title: string;
  context: string;
  status: 'draft' | 'analyzing' | 'completed' | 'challenged';
  recommendation?: string;
  alternative_recommendation?: string;
  confidence_score: number;
  decision_score: number;
  reasoning_summary?: string;
  what_could_change: string[];
  contradictions: string[];
  challenge_history: Array<{
    timestamp: string;
    target: string;
    original_confidence: number;
    recalculated_confidence: number;
    delta: number;
    critique: string;
  }>;
  options: DecisionOption[];
  factors: DecisionFactor[];
  goals: Goal[];
  constraints: Constraint[];
  evidence_items: EvidenceItem[];
  agent_runs: AgentRun[];
  created_at: string;
  updated_at: string;
}

export interface DecisionListItem {
  id: number;
  title: string;
  status: string;
  recommendation?: string;
  confidence_score: number;
  decision_score: number;
  options_count: number;
  created_at: string;
}

export interface ChallengeResult {
  decision_id: number;
  original_confidence: number;
  recalculated_confidence: number;
  confidence_delta: number;
  vulnerabilities: string[];
  attack_vector: string;
  devil_advocate_critique: string;
  alternative_scenario: string;
  fragility_verdict: string;
}

export interface SimulationResult {
  scenario_id: number;
  decision_id: number;
  title: string;
  recommended_option_before: string;
  recommended_option_after: string;
  confidence_before: number;
  confidence_after: number;
  score_delta: number;
  key_drivers: string[];
  diff_explanation: string;
  updated_option_scores: Record<string, number>;
}

export interface DecisionOutcome {
  id: number;
  decision_id: number;
  chosen_option_title: string;
  actual_outcome_notes?: string;
  satisfaction_score: number;
  ai_accuracy_rating: number;
  recorded_at: string;
}

export interface DocumentItem {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  chunk_count: number;
  created_at: string;
}
