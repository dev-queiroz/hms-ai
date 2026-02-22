export type UserRole = 'admin' | 'professional';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
}
