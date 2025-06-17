import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      cookies?: {
        [key: string]: string;
      };
      headers: {
        authorization?: string;
        [key: string]: string | string[] | undefined;
      };
    }
  }
} 