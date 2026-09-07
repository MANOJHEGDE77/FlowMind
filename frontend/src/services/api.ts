import {
  User, Decision, DecisionListItem, ChallengeResult,
  SimulationResult, DecisionOutcome, DocumentItem
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private token: string | null = localStorage.getItem('flowmind_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('flowmind_token', token);
    } else {
      localStorage.removeItem('flowmind_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth
  async register(data: { email: string; password: string; full_name?: string }): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Decisions
  async listDecisions(): Promise<DecisionListItem[]> {
    return this.request<DecisionListItem[]>('/decisions');
  }

  async getDecision(id: number): Promise<Decision> {
    return this.request<Decision>(`/decisions/${id}`);
  }

  async createQuickDecision(prompt: string): Promise<Decision> {
    return this.request<Decision>('/decisions/quick', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async createDecision(data: {
    title: string;
    context: string;
    options: Array<{ title: string; description?: string }>;
    factors?: Array<{ name: string; category: string; weight: number }>;
    goals?: Array<{ description: string; priority: string; weight: number }>;
    constraints?: Array<{ description: string; severity: string }>;
  }): Promise<Decision> {
    return this.request<Decision>('/decisions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteDecision(id: number): Promise<void> {
    await this.request(`/decisions/${id}`, { method: 'DELETE' });
  }

  async runAnalysis(id: number): Promise<Decision> {
    return this.request<Decision>(`/decisions/${id}/analyze`, {
      method: 'POST',
    });
  }

  // Challenge Engine
  async challengeDecision(
    id: number,
    data: { target_recommendation?: string; focus_area?: string }
  ): Promise<ChallengeResult> {
    return this.request<ChallengeResult>(`/decisions/${id}/challenge`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // What-If Simulator
  async simulateWhatIf(
    id: number,
    data: { scenario_title: string; modifications: Record<string, any> }
  ): Promise<SimulationResult> {
    return this.request<SimulationResult>(`/decisions/${id}/simulate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Outcomes
  async recordOutcome(
    id: number,
    data: {
      chosen_option_title: string;
      actual_outcome_notes?: string;
      satisfaction_score: number;
      ai_accuracy_rating: number;
    }
  ): Promise<DecisionOutcome> {
    return this.request<DecisionOutcome>(`/decisions/${id}/outcomes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Documents / RAG
  async uploadDocument(file: File, decisionId?: number): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (decisionId) {
      formData.append('decision_id', decisionId.toString());
    }

    return this.request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiService();
