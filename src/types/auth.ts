export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
} 