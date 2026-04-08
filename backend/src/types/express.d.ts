export {};

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId?: string;
        sessionClaims?: Record<string, any>;
      };
      user?: {
        id: string;
      };
    }
  }
}