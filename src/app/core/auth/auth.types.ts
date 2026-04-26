export type UserKind = 'SYSTEM_ADMIN' | 'TENANT_USER';

/** Shape devuelto por GET /users/me y dentro de LoginResponse.user. */
export interface UserResponse {
  id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePhoto?: string;
  theme?: string;
  languageCode?: string;
  lastLoginAt?: string;
  enabled?: boolean;
  visible?: boolean;
  roleCodes?: string[];
  createdDate?: string;
}

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;     // "Bearer"
  expiresInSeconds: number;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  tokens: TokenPairResponse;
  user: UserResponse;
}

/** Vista normalizada que usa la app. */
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  roles: string[];
  kind: UserKind;
  tenantId?: string | null;
  theme?: string;
  languageCode?: string;
}
