/** Envelope returned by saas-back. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  status?: number;
  timestamp?: string;
  errors?: Record<string, string[]>;
}
