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
  source_type?: 'FACT_FROM_DOCUMENT' | 'AI_INFERENCE' | 'USER_ASSUMPTION';
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
    attackedOption?: string;
    criticalAssumptions?: string[];
    failureScenarios?: string[];
    counterArguments?: string[];
    questionsToValidate?: string[];
    confidenceAdjustment?: number;
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
  attackedOption?: string;
  criticalAssumptions?: string[];
  failureScenarios?: string[];
  counterArguments?: string[];
  questionsToValidate?: string[];
  confidenceAdjustment?: number;
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
  monte_carlo_runs?: number;
  outcome_distribution?: Record<string, number>;
  expected_outcome?: number;
  downside_risk?: number;
  upside_potential?: number;
  volatility?: number;
  probability_ranges?: Record<string, number>;
  disclaimer?: string;
}

export interface DecisionOutcome {
  id: number;
  decision_id: number;
  chosen_option_title: string;
  actual_outcome_notes?: string;
  expected_outcome?: string;
  what_went_right?: string[];
  what_went_wrong?: string[];
  incorrect_assumptions?: string[];
  lessons_learned?: string;
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

// ----------------- FlowMind Thought Flow Architecture -----------------

export type FlowNodeType = 'core' | 'idea' | 'decision' | 'task' | 'goal' | 'result' | 'resource';

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  title: string;
  description?: string;
  x: number;
  y: number;
  parentId?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked';
  aiSummary?: string;
  suggestedActions?: string[];
  relatedThoughts?: string[];
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  color?: string;
}

export interface FlowGraph {
  id: string;
  title: string;
  description: string;
  category: 'Learning' | 'Career' | 'Projects' | 'Personal Goals' | 'Ideas';
  createdAt: string;
  updatedAt: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  progress: number;
  starred?: boolean;
}

export interface ConnectedTask {
  id: string;
  title: string;
  flowId: string;
  flowTitle: string;
  nodeId?: string;
  nodeTitle?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedMinutes?: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  type: 'note' | 'document' | 'link' | 'bookmark' | 'ai_summary';
  connectedFlows: string[];
  snippet: string;
  url?: string;
  tags: string[];
  updatedAt: string;
}

export interface ThinkingPattern {
  id: string;
  type: 'pattern' | 'next_move' | 'connection';
  title: string;
  insight: string;
  actionText: string;
  flowId?: string;
  targetNodeId?: string;
}

