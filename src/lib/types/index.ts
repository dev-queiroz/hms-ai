export type UserRole = 'ADMINISTRADOR_PRINCIPAL' | 'MEDICO' | 'ENFERMEIRO';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
}
