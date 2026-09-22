import {
  User, Decision, DecisionListItem, ChallengeResult,
  SimulationResult, DecisionOutcome, DocumentItem
} from '../types';

let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // Response was not JSON
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err: any) {
      // Auto-recover between port 8080 and 8000 if network fails
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
        const altBase = API_BASE.includes('8080')
          ? API_BASE.replace('8080', '8000')
          : API_BASE.replace('8000', '8080');
        try {
          const fallbackResp = await fetch(`${altBase}${endpoint}`, {
            ...options,
            headers,
          });
          if (fallbackResp.ok) {
            API_BASE = altBase;
            return await fallbackResp.json();
          }
        } catch {
          // Fallback also failed, proceed with original error
        }
      }
      throw err;
    }
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
      expected_outcome?: string;
      what_went_right?: string[];
      what_went_wrong?: string[];
      incorrect_assumptions?: string[];
      lessons_learned?: string;
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

  // AI Question Answering (Gemini / Efficient Model)
  async askAI(data: {
    question: string;
    decisionId?: number;
    context?: string;
    history?: Array<{ role: string; content: string }>;
    apiKey?: string;
  }): Promise<{
    question: string;
    answer: string;
    model_used: string;
    confidence: number;
    relevant_factors: string[];
    suggested_followups: string[];
    citations: string[];
  }> {
    const endpoint = data.decisionId ? `/decisions/${data.decisionId}/ask` : '/ai/ask';
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        question: data.question,
        decision_id: data.decisionId,
        context: data.context,
        history: data.history || [],
        api_key: data.apiKey,
      }),
    });
  }

  // Gemini AI Status & Key Configuration
  async getAIConfig(): Promise<{
    gemini_configured: boolean;
    model: string;
    provider: string;
    free_tier_url: string;
  }> {
    return this.request('/ai/config', { method: 'GET' });
  }

  async configureGeminiKey(key: string): Promise<{
    success: boolean;
    message: string;
    model: string;
  }> {
    return this.request('/ai/config', {
      method: 'POST',
      body: JSON.stringify({ gemini_api_key: key }),
    });
  }

  // Real-Time Pathway & Option Suggestion
  async suggestOptions(prompt: string, context?: string): Promise<{
    prompt: string;
    suggested_title: string;
    options: Array<{ title: string; description: string }>;
    factors?: Array<{ name: string; category: string; weight: number }>;
    goals?: Array<{ description: string; priority: string; weight: number }>;
    constraints?: Array<{ description: string; severity: string }>;
  }> {
    return this.request('/ai/suggest-options', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }
}

export const api = new ApiService();
