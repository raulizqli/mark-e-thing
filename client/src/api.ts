// client/src/api.ts
import { supabase } from './supabase.js';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { message: string; details: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface SearchRecord {
  id: string;
  userId: string;
  category: string;
  city: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalFound: number;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
  createdAt: string;
}

export interface SearchStatus {
  id: string;
  status: SearchRecord['status'];
  totalFound: number;
  progress: number;
}

export interface SearchAnalytics {
  searchId: string;
  totalBusinesses: number;
  analyzedBusinesses: number;
  averageLeadScore: number | null;
  priorityDistribution: Array<{ priority: string; count: number }>;
  withWebsite: number;
  withEmail: number;
  withValidSsl: number;
}

export interface CreateSearchPayload {
  category: string;
  city?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('Sign in required');
  }
  return token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (response.status === 401) {
      throw new Error('Session expired. Please sign in again.');
    }
    throw new Error(`Unexpected response (${response.status})`);
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (!body.success) {
    throw new Error(body.error.message);
  }

  return body.data;
}

export function createSearch(
  payload: CreateSearchPayload,
): Promise<SearchRecord> {
  return request<SearchRecord>('/searches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getSearchStatus(searchId: string): Promise<SearchStatus> {
  return request<SearchStatus>(`/searches/${searchId}/status`);
}

export function getSearchAnalytics(searchId: string): Promise<SearchAnalytics> {
  return request<SearchAnalytics>(`/searches/${searchId}/analytics`);
}

export async function downloadExport(
  searchId: string,
  format: 'csv' | 'excel' | 'json',
): Promise<void> {
  const token = await getAccessToken();
  const response = await fetch(
    `/searches/${searchId}/export?format=${format}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const body = (await response.json()) as ApiError;
      throw new Error(body.error?.message ?? 'Export failed');
    }
    throw new Error(`Export failed (${response.status})`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = /filename="?([^"]+)"?/i.exec(disposition);
  const filename = match?.[1] ?? `search-${searchId}.${format === 'excel' ? 'xlsx' : format}`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
