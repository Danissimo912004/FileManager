import { Store } from 'pinia';

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface AuthStore extends Store<'auth', AuthState> {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
} 