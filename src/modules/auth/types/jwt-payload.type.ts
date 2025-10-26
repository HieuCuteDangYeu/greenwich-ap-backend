export interface JwtPayload {
  sub: string;
  email: string;
  role?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  code?: string | null;
  staffRole?: string | null;
}
