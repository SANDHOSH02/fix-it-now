/**
 * Fix It Now — Frontend API client
 * Wraps fetch with auth headers, base URL, and typed responses.
 * Used by TanStack Query hooks.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

// ─── Token storage ────────────────────────────────────────────────────────────

export const tokenStore = {
  getAccess:     () => localStorage.getItem("fin_access_token"),
  getRefresh:    () => localStorage.getItem("fin_refresh_token"),
  setTokens:     (access: string, refresh: string) => {
    localStorage.setItem("fin_access_token", access);
    localStorage.setItem("fin_refresh_token", refresh);
  },
  clearTokens:   () => {
    localStorage.removeItem("fin_access_token");
    localStorage.removeItem("fin_refresh_token");
  },
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = true, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (auth) {
    const token = tokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${tokenStore.getAccess()}`;
      const retryRes = await fetch(`${BASE_URL}${path}`, { ...init, headers });
      return parseResponse<T>(retryRes);
    } else {
      tokenStore.clearTokens();
      window.location.href = "/";
      throw new Error("Session expired");
    }
  }

  return parseResponse<T>(res);
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.error ?? "Request failed") as Error & { details?: unknown; status?: number };
    err.details = json.details;
    err.status = res.status;
    throw err;
  }
  return json as T;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const json = await res.json() as { data: { accessToken: string; refreshToken: string } };
    tokenStore.setTokens(json.data.accessToken, json.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ─── Typed API methods ────────────────────────────────────────────────────────

export interface ApiUser {
  id: string; name: string; email: string;
  role: "CITIZEN" | "ADMIN" | "SUPER_ADMIN";
  district?: string; phone?: string; avatarUrl?: string; createdAt: string;
}

export interface ApiComplaint {
  id: string; refId: string; title: string; category: string;
  status: string; priority: string; lat: number; lng: number;
  address: string; city: string; district: string;
  photoUrl?: string; aiConfidence: number; upvotes: number;
  isDuplicate: boolean; createdAt: string;
  reporter: { id: string; name: string };
  department?: { id: string; name: string };
}

export interface ApiComplaintDetail extends ApiComplaint {
  description: string;
  statusHistory: { id: string; status: string; note?: string; createdAt: string }[];
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export interface ApiSingleResponse<T> {
  success: true;
  data: T;
}

// Auth
export const authApi = {
  register: (body: { name: string; email: string; password: string; district?: string }) =>
    apiFetch<ApiSingleResponse<{ user: ApiUser; accessToken: string; refreshToken: string }>>(
      "/auth/register", { method: "POST", body: JSON.stringify(body), auth: false },
    ),

  login: (body: { email: string; password: string }) =>
    apiFetch<ApiSingleResponse<{ user: ApiUser; accessToken: string; refreshToken: string }>>(
      "/auth/login", { method: "POST", body: JSON.stringify(body), auth: false },
    ),

  logout: () =>
    apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: tokenStore.getRefresh() }),
    }),

  me: () => apiFetch<ApiSingleResponse<ApiUser>>("/auth/me"),
};

// Complaints
export const complaintsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<ApiListResponse<ApiComplaint>>(`/complaints${qs}`);
  },

  get: (id: string) =>
    apiFetch<ApiSingleResponse<ApiComplaintDetail>>(`/complaints/${id}`),

  create: (body: {
    title: string; category: string; description: string;
    lat: number; lng: number; address: string; city: string; district: string;
    photoUrl?: string;
  }) => apiFetch<ApiSingleResponse<{ complaint: ApiComplaintDetail; isDuplicate: boolean }>>(
    "/complaints", { method: "POST", body: JSON.stringify(body) },
  ),

  updateStatus: (id: string, status: string, note?: string) =>
    apiFetch<ApiSingleResponse<ApiComplaintDetail>>(`/complaints/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }),

  assign: (id: string, departmentId: string) =>
    apiFetch<ApiSingleResponse<ApiComplaintDetail>>(`/complaints/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ departmentId }),
    }),

  upvote: (id: string) =>
    apiFetch<ApiSingleResponse<{ id: string; upvotes: number }>>(`/complaints/${id}/upvote`, {
      method: "POST",
    }),

  myComplaints: () =>
    apiFetch<ApiSingleResponse<ApiComplaintDetail[]>>("/users/me/complaints"),
};

// Departments
export const departmentsApi = {
  list: () => apiFetch<ApiSingleResponse<{ id: string; name: string; _count: { complaints: number } }[]>>("/departments"),
};

// Admin
export const adminApi = {
  stats: () => apiFetch<ApiSingleResponse<Record<string, unknown>>>("/admin/stats"),
  heatmap: () => apiFetch<ApiSingleResponse<{ cid: number; lat: number; lng: number; count: number }[]>>("/admin/heatmap"),
  users: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<ApiListResponse<ApiUser>>(`/admin/users${qs}`);
  },
};

// Users / Profile
export interface ApiNotification {
  id: string; title: string; body: string; isRead: boolean; type: string; refId?: string; createdAt: string;
}

export const usersApi = {
  getProfile: () => apiFetch<ApiSingleResponse<ApiUser>>("/users/me"),

  updateProfile: (body: { name?: string; phone?: string; district?: string }) =>
    apiFetch<ApiSingleResponse<ApiUser>>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getNotifications: () =>
    apiFetch<ApiSingleResponse<ApiNotification[]>>("/users/me/notifications"),

  markNotificationRead: (id: string) =>
    apiFetch<ApiSingleResponse<{ message: string }>>(`/users/me/notifications/${id}/read`, {
      method: "PATCH",
    }),
};

// Chat (Ollama)
export interface ChatMessage { role: "user" | "assistant"; content: string }

export const chatApi = {
  send: (messages: ChatMessage[]) =>
    apiFetch<ApiSingleResponse<{ message: string }>>("/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
      auth: false,
    }),
};
