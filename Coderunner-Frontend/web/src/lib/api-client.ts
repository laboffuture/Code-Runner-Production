/**
 * API Client for Code Runner Web App
 *
 * This client handles all communication with the backend API service.
 * It abstracts fetch calls and provides a clean interface for API requests.
 */

/**
 * Determine the API base URL dynamically.
 *
 * Problem: NEXT_PUBLIC_API_URL is baked into the JS bundle at build time.
 * When another device on the LAN opens http://192.168.x.x:3000, its browser
 * would call "localhost:4000" on its own machine — not the dev server.
 *
 * Solution: if the configured URL points to localhost (or none is set), derive
 * the API host from window.location.hostname so the correct IP is always used.
 */
function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || '';

  // SSR / non-browser — fall back to the env var or localhost
  if (typeof window === 'undefined') {
    return configured || 'http://localhost:4000';
  }

  // If an explicit, non-localhost URL is configured use it as-is (production, tunnel, etc.)
  if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return configured;
  }

  // Derive from the browser's current host so LAN access works automatically:
  // - localhost:3000  → http://localhost:4000
  // - 192.168.1.x:3000 → http://192.168.1.x:4000
  const apiPort = configured ? new URL(configured).port || '4000' : '4000';
  return `${window.location.protocol}//${window.location.hostname}:${apiPort}`;
}

const API_URL = resolveApiUrl();

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  /**
   * Build headers with authentication
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic request method
   */
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options.headers);

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      credentials: options.credentials || 'include',
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return (await response.text()) as T;
      }

      const data = await response.json();

      if (!response.ok) {
        const err = new Error(data.error || data.message || `HTTP ${response.status}`);
        (err as any).status = response.status;
        throw err;
      }

      return data as T;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_URL);

// Export typed API methods for common operations
export const api = {
  // Authentication
  auth: {
    login: (username: string, password: string) =>
      apiClient.post('/auth/login', { username, password }),
    register: (username: string, email: string, password: string, age_group: '11-14' | '15-18') =>
      apiClient.post('/auth/register', { username, email, password, age_group }),
    logout: () => apiClient.post('/auth/logout', {}),
    me: () => apiClient.get('/auth/me'), // Get current authenticated user
  },

  // Users
  users: {
    getStats: () => apiClient.get('/users/me/stats'),
    getActivity: () => apiClient.get('/users/me/activity'),
    getAchievements: () => apiClient.get('/users/me/achievements'),
    selectCharacter: (character: 'astra' | 'nila' | 'kenji' | 'leo') =>
      apiClient.patch('/users/me/character', { character }),
    updateProfile: (data: { avatar?: string; bio?: string; preferences?: any }) =>
      apiClient.patch('/users/me', data),
  },

  // Leaderboard
  leaderboard: {
    getGlobal: (params?: { limit?: number; sortBy?: string; skip?: number }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.skip) query.append('skip', params.skip.toString());
      return apiClient.get(`/leaderboard/global?${query.toString()}`);
    },
    getUserRank: (userId: string) => apiClient.get(`/leaderboard/rank/${userId}`),
  },

  // Problems
  problems: {
    getAll: () => apiClient.get('/problems'),
    getById: (id: number) => apiClient.get(`/problems/${id}`),
    getTestCases: (id: number) => apiClient.get(`/problems/${id}/test-cases`),
  },

  // Levels
  levels: {
    getByAgeGroup: (ageGroup: '11-14' | '15-18') =>
      apiClient.get(`/levels/${ageGroup}`),
  },

  // Sessions
  sessions: {
    getById: (id: number) => apiClient.get(`/sessions/${id}`),
  },

  // Code Execution (Queue-based via Express API)
  execution: {
    // Submit code for execution (returns jobId)
    submit: (code: string, input?: string, images?: File[], userSessionId?: string) =>
      apiClient.post('/execution/submit', { code, input, images, userSessionId }),

    // Get execution result by jobId
    getResult: (jobId: string) => apiClient.get(`/execution/result/${jobId}`),

    // Submit code for grading against test cases (optional contestId for contest submissions)
    submitForGrading: (code: string, problemId: number, contestId?: string) =>
      apiClient.post('/execution/submit/grade', {
        code,
        problemId,
        ...(contestId ? { contestId } : {}),
      }),

    // Poll for result with timeout
    // maxAttempts=90 × interval=1000ms = 90 second timeout
    // Handles cold-start delays when the runner is still warming up Docker containers
    waitForResult: async (jobId: string, maxAttempts = 90, interval = 1000) => {
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const result = await apiClient.get<any>(`/execution/result/${jobId}`);

          if (result.status === 'completed' || result.status === 'failed') {
            return result;
          }
        } catch (error: any) {
          // If the job isn't found yet (404) or there's a transient network error,
          // keep polling instead of aborting. This handles the case where the
          // runner picks up the job before the DB record is fully committed.
          const is404 = error?.status === 404;
          const isNetwork = error instanceof TypeError && error.message === 'Failed to fetch';
          if (!is404 && !isNetwork) {
            throw error; // Re-throw unexpected errors immediately
          }
        }

        await new Promise(resolve => setTimeout(resolve, interval));
      }

      throw new Error('System is warming up. Please try running your code again in a few seconds.');
    },
  },

  // Progress
  progress: {
    get: (userId: string) => apiClient.get(`/progress?userId=${userId}`),
    complete: (data: any) => apiClient.post('/progress/complete', data),
  },

  // Admin
  admin: {
    system: () => apiClient.get('/admin/system'),
    queues: () => apiClient.get('/admin/queues'),
    docker: () => apiClient.get('/admin/docker'),
    logs: (limit?: number) => apiClient.get(`/admin/logs${limit ? `?limit=${limit}` : ''}`),
    users: () => apiClient.get('/admin/users'),
    errors: () => apiClient.get('/admin/errors'),
    railwayMetrics: (timeRange: '1h' | '6h' | '1d' | '7d' | '30d', serviceName: string) =>
      apiClient.get(`/admin/railway/metrics?timeRange=${timeRange}&serviceName=${serviceName}`),
    nginxMetrics: (timeRange: '1h' | '6h' | '1d' | '7d' | '30d') =>
      apiClient.get(`/admin/nginx/metrics?timeRange=${timeRange}`),
    apiMetrics: (timeRange: '1h' | '6h' | '1d' | '7d' | '30d', apiName: 'API-1' | 'API-2') =>
      apiClient.get(`/admin/api/metrics?timeRange=${timeRange}&apiName=${apiName}`),
    redisMetrics: (timeRange: '1h' | '6h' | '1d' | '7d' | '30d') =>
      apiClient.get(`/admin/redis/metrics?timeRange=${timeRange}`),
    runnerMetrics: (timeRange: '1h' | '6h' | '1d' | '7d' | '30d', runnerName: 'Runner-1' | 'Runner-2') =>
      apiClient.get(`/admin/runner/metrics?timeRange=${timeRange}&runnerName=${runnerName}`),
    dockerMetrics: (timeRange: '1h' | '6h' | '1d' | '7d' | '30d') =>
      apiClient.get(`/admin/docker/metrics?timeRange=${timeRange}`),
    queueMetrics: (timeRange: '1h' | '6h' | '1d' | '7d' | '30d', queueType: 'execution' | 'submission') =>
      apiClient.get(`/admin/queue/metrics?timeRange=${timeRange}&queueType=${queueType}`),
    errorAnalytics: (timeRange: '1h' | '6h' | '1d' | '7d' | '30d') =>
      apiClient.get(`/admin/error/analytics?timeRange=${timeRange}`),
    mongodbStats: () => apiClient.get('/admin/mongodb/stats'),
    mongodbAtlas: () => apiClient.get('/admin/mongodb/atlas'),
    cloudinaryStats: () => apiClient.get('/admin/cloudinary/stats'),
  },

  // Contests
  contests: {
    list: (params?: { status?: string; ageGroup?: string; page?: number }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.ageGroup) q.append('ageGroup', params.ageGroup);
      if (params?.page) q.append('page', String(params.page));
      return apiClient.get(`/contests?${q.toString()}`);
    },
    getById: (id: string) => apiClient.get(`/contests/${id}`),
    register: (id: string) => apiClient.post(`/contests/${id}/register`, {}),
    getLeaderboard: (id: string) => apiClient.get(`/contests/${id}/leaderboard`),
    getMyEntry: (id: string) => apiClient.get(`/contests/${id}/my-entry`),
    // Admin
    create: (data: any) => apiClient.post('/contests', data),
    update: (id: string, data: any) => apiClient.patch(`/contests/${id}`, data),
    end: (id: string) => apiClient.post(`/contests/${id}/end`, {}),
    delete: (id: string) => apiClient.delete(`/contests/${id}`),
  },

  // Health
  health: {
    metrics: () => apiClient.get('/health/metrics'),
  },

  // Files
  files: {
    upload: (data: any) => apiClient.post('/files', data),
    list: (userSessionId: string) => apiClient.get(`/files/list?userSessionId=${userSessionId}`),
    delete: (fileName: string, userSessionId: string) =>
      apiClient.post('/files/delete', { fileName, userSessionId }),
    get: (fileName: string, userSessionId: string) =>
      apiClient.get(`/files?fileName=${fileName}&userSessionId=${userSessionId}`),
  },
};

export default apiClient;
