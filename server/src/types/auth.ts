import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../models/User';

export interface TokenPayload extends JwtPayload {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
  token: string;
}

export interface AuthRequest extends Omit<Request, 'user' | 'cookies'> {
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
  cookies?: {
    [key: string]: string;
  };
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
} 