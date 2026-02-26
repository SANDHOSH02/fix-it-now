import { Request } from "express";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;       // user UUID
  email: string;
  role: "CITIZEN" | "ADMIN" | "SUPER_ADMIN";
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// ─── API Response envelopes ───────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: string;
  pageSize?: string;
}

export interface ComplaintsFilter extends PaginationQuery {
  status?: string;
  category?: string;
  priority?: string;
  departmentId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
