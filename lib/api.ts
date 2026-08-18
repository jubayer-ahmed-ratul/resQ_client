const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  body?: unknown;
  token?: string;
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? JSON.stringify(data);
    throw new Error(msg);
  }

  return data as T;
}

// ── Pagination wrapper ─────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ── HTTP helpers ───────────────────────────────────────────
export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>("GET", endpoint, { token }),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>("POST", endpoint, { body, token }),

  put: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>("PUT", endpoint, { body, token }),

  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>("PATCH", endpoint, { body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>("DELETE", endpoint, { token }),
};

// ── Token helper ───────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// ── Types ──────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COORDINATOR" | "OPERATOR" | "CITIZEN";
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "VALIDATED" | "PROCESSING" | "ASSIGNED" | "DISPATCHED" | "RESOLVED" | "CANCELLED";
  affectedPeople: number;
  latitude: number;
  longitude: number;
  timeSensitivity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  environmentalCondition: string;
  resourceRequirements: string[];
  priorityScore: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentBody {
  title: string;
  description: string;
  severity: Incident["severity"];
  affectedPeople: number;
  latitude: number;
  longitude: number;
  timeSensitivity: Incident["timeSensitivity"];
  environmentalCondition: string;
  resourceRequirements: string[];
}

// Real API: AVAILABLE | BUSY | UNAVAILABLE | MAINTENANCE | FAILED
export type ResourceStatus = "AVAILABLE" | "BUSY" | "UNAVAILABLE" | "MAINTENANCE" | "FAILED";

export interface Resource {
  id: string;
  name: string;
  type: "AMBULANCE" | "RESCUE_TEAM" | "HELICOPTER" | "OTHER";
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceBody {
  name: string;
  type: Resource["type"];
  latitude: number;
  longitude: number;
  capacity?: number;
  status?: ResourceStatus;
}

// Real API: OPERATIONAL | LIMITED | CLOSED
export type HospitalStatus = "OPERATIONAL" | "LIMITED" | "CLOSED";

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  bedCapacity: number;
  availableBeds: number;
  icuCapacity: number;
  availableICUBeds: number;
  status: HospitalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHospitalBody {
  name: string;
  latitude: number;
  longitude: number;
  bedCapacity: number;
  availableBeds: number;
  icuCapacity: number;
  availableICUBeds: number;
  status?: HospitalStatus;
}

export interface UpdateHospitalBody {
  availableBeds?: number;
  availableICUBeds?: number;
  status?: HospitalStatus;
}

// ── Auth API ───────────────────────────────────────────────
export const authApi = {
  login: (body: { email: string; password: string }) =>
    api.post<{ success: boolean; message: string; data: { token: string; user: User } }>(
      "/auth/login", body
    ),

  register: (body: { name: string; email: string; password: string; role?: User["role"] }) =>
    api.post<{ success: boolean; message: string; data: { token: string; user: User } }>(
      "/auth/register", body
    ),

  me: (token: string) =>
    api.get<{ success: boolean; data: User }>(
      "/auth/me", token
    ),
};

// ── Decision Log ───────────────────────────────────────────
export interface DecisionLog {
  id: string;
  incidentId: string;
  decisionType: "PRIORITY_CALCULATION" | "RESOURCE_RECOMMENDATION" | "RESOURCE_ASSIGNMENT" | "RESOURCE_REJECTION";
  priorityScore: number | null;
  selectedResourceId: string | null;
  explanation: Record<string, unknown>;
  factors: Record<string, unknown> | null;
  algorithmVersion: string;
  createdAt: string;
}

// ── Assignment ─────────────────────────────────────────────
export interface Assignment {
  id: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  incidentId: string;
  resourceId: string;
  incident?: Partial<Incident>;
  resource?: Partial<Resource>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentBody {
  incidentId: string;
  resourceId: string;
}

// ── Resource Recommendation ────────────────────────────────
export interface ResourceRecommendation {
  incidentId: string;
  selectedResource: {
    id: string;
    name: string;
    type: string;
    status: string;
    capacity: number;
    latitude: number;
    longitude: number;
    estimatedEtaMinutes?: number;
  } | null;
  estimatedDistanceKm: number | null;
  estimatedEtaMinutes: number | null;
  reasons: string[];
  rejectedCandidates: {
    resourceId: string;
    resourceName: string;
    reason: string;
  }[];
  message: string;
}

// ── Priority Engine ────────────────────────────────────────
export interface PriorityFactor {
  rawValue?: string | number;
  normalizedScore: number;
  weightedScore: number;
  reason: string;
}

export interface PriorityResult {
  priorityScore: number;
  factors: {
    severity:             PriorityFactor;
    timeSensitivity:      PriorityFactor;
    affectedPopulation:   PriorityFactor;
    environmentalRisk:    PriorityFactor;
    resourceRequirements: PriorityFactor;
  };
  reasons: string[];
}

// ── Reoptimization ─────────────────────────────────────────
export type ReoptimizationTrigger =
  | "RESOURCE_FAILURE"
  | "RESOURCE_UNAVAILABLE"
  | "RESOURCE_MAINTENANCE"
  | "ACCESS_CONDITION_CHANGE"
  | "HIGHER_PRIORITY_INCIDENT"
  | "CAPACITY_CHANGE";

export interface ReoptimizationLog {
  id: string;
  incidentId: string;
  triggeredBy: ReoptimizationTrigger;
  oldAssignmentId: string;
  newAssignmentId: string | null;
  oldResourceId: string;
  newResourceId: string | null;
  decisionLogId: string | null;
  replaced: boolean;
  reason: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface ReoptimizeResult {
  reoptimized: boolean;
  replacementFound: boolean;
  message: string;
  oldAssignmentId?: string;
  newAssignmentId?: string | null;
  oldResourceId?: string;
  newResourceId?: string | null;
  log?: ReoptimizationLog;
}

export interface ReoptimizeBody {
  trigger: ReoptimizationTrigger;
  accessCondition?: "NORMAL" | "BLOCKED";
  competingIncidentPriority?: number;
}

// ── List params ────────────────────────────────────────────
export interface IncidentListParams {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  sort?: "priority";
}

export interface ResourceListParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

export interface HospitalListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AssignmentListParams {
  page?: number;
  limit?: number;
  status?: string;
  incidentId?: string;
  resourceId?: string;
}

// ── Incidents API ──────────────────────────────────────────
export const incidentApi = {
  create: (body: CreateIncidentBody, token: string) =>
    api.post<{ success: boolean; message: string; data: Incident }>(
      "/incidents", body, token
    ),

  list: (token: string, params?: IncidentListParams) => {
    const query = params
      ? "?" + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : "";
    return api.get<{ success: boolean; data: PaginatedResponse<Incident> }>(
      `/incidents${query}`, token
    );
  },

  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: Incident }>(
      `/incidents/${id}`, token
    ),

  update: (id: string, body: Partial<CreateIncidentBody>, token: string) =>
    api.patch<{ success: boolean; message: string; data: Incident }>(
      `/incidents/${id}`, body, token
    ),

  validate: (id: string, token: string) =>
    api.patch<{ success: boolean; message: string; data: Incident }>(
      `/incidents/${id}/validate`, {}, token
    ),

  updateStatus: (id: string, status: Incident["status"], token: string) =>
    api.patch<{ success: boolean; message: string; data: Incident }>(
      `/incidents/${id}/status`, { status }, token
    ),

  calculatePriority: (id: string, token: string) =>
    api.post<{ success: boolean; data: PriorityResult }>(
      `/incidents/${id}/calculate-priority`, {}, token
    ),

  recommendResource: (id: string, token: string) =>
    api.post<{ success: boolean; data: ResourceRecommendation }>(
      `/incidents/${id}/recommend-resource`, {}, token
    ),
};

// ── Decision API ───────────────────────────────────────────
export const decisionApi = {
  list: (token: string, params?: { page?: number; limit?: number }) => {
    const query = params
      ? "?" + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : "";
    return api.get<{ success: boolean; data: PaginatedResponse<DecisionLog> }>(
      `/decisions${query}`, token
    );
  },

  listByIncident: (incidentId: string, token: string) =>
    api.get<{ success: boolean; data: DecisionLog[] }>(
      `/incidents/${incidentId}/decisions`, token
    ),

  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: DecisionLog }>(
      `/decisions/${id}`, token
    ),
};

// ── Assignments API ────────────────────────────────────────
export const assignmentApi = {
  create: (body: CreateAssignmentBody, token: string) =>
    api.post<{ success: boolean; message: string; data: Assignment }>(
      "/assignments", body, token
    ),

  list: (token: string, params?: AssignmentListParams) => {
    const query = params
      ? "?" + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : "";
    return api.get<{ success: boolean; data: PaginatedResponse<Assignment> }>(
      `/assignments${query}`, token
    );
  },

  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: Assignment }>(
      `/assignments/${id}`, token
    ),

  complete: (id: string, token: string) =>
    api.patch<{ success: boolean; message: string; data: Assignment }>(
      `/assignments/${id}/complete`, {}, token
    ),

  cancel: (id: string, token: string) =>
    api.patch<{ success: boolean; message: string; data: Assignment }>(
      `/assignments/${id}/cancel`, {}, token
    ),
};

// ── Resources API ──────────────────────────────────────────
export const resourceApi = {
  create: (body: CreateResourceBody, token: string) =>
    api.post<{ success: boolean; message: string; data: Resource }>(
      "/resources", body, token
    ),

  list: (token: string, params?: ResourceListParams) => {
    const query = params
      ? "?" + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : "";
    return api.get<{ success: boolean; data: PaginatedResponse<Resource> }>(
      `/resources${query}`, token
    );
  },

  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: Resource }>(
      `/resources/${id}`, token
    ),

  update: (id: string, body: Partial<CreateResourceBody & { status: ResourceStatus }>, token: string) =>
    api.patch<{ success: boolean; message: string; data: Resource }>(
      `/resources/${id}`, body, token
    ),
};

// ── Hospitals API ──────────────────────────────────────────
export const hospitalApi = {
  create: (body: CreateHospitalBody, token: string) =>
    api.post<{ success: boolean; message: string; data: Hospital }>(
      "/hospitals", body, token
    ),

  list: (token: string, params?: HospitalListParams) => {
    const query = params
      ? "?" + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : "";
    return api.get<{ success: boolean; data: PaginatedResponse<Hospital> }>(
      `/hospitals${query}`, token
    );
  },

  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: Hospital }>(
      `/hospitals/${id}`, token
    ),

  getAvailability: (id: string, token: string) =>
    api.get<{
      success: boolean;
      data: Pick<Hospital, "id" | "name" | "status" | "bedCapacity" | "availableBeds" | "icuCapacity" | "availableICUBeds">;
    }>(`/hospitals/${id}/availability`, token),

  update: (id: string, body: UpdateHospitalBody, token: string) =>
    api.patch<{ success: boolean; message: string; data: Hospital }>(
      `/hospitals/${id}`, body, token
    ),
};

// ── Reoptimization API ─────────────────────────────────────
export const reoptimizationApi = {
  reoptimize: (assignmentId: string, body: ReoptimizeBody, token: string) =>
    api.post<{ success: boolean; data: ReoptimizeResult }>(
      `/assignments/${assignmentId}/reoptimize`, body, token
    ),

  listByIncident: (incidentId: string, token: string) =>
    api.get<{ success: boolean; data: ReoptimizationLog[] }>(
      `/incidents/${incidentId}/reoptimizations`, token
    ),

  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: ReoptimizationLog }>(
      `/reoptimizations/${id}`, token
    ),
};
