import { JwtPayload } from '../auth/types/jwt-payload.type';

declare global {
  namespace Express {
    interface Request {
      payload?: JwtPayload;
      issuedJwt?: string;
    }
  }
}

export {};
