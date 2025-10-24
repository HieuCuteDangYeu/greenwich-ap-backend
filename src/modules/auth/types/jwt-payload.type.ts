export interface JwtPayload {
  sub: string;
  email: string;
  role?: string | null;
  surname?: string | null;
  givenName?: string | null;
  avatar?: string | null;
  code?: string | null;
  staffRole?: string | null;
}
