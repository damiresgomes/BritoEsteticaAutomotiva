import api from './api';

export interface LoginCredentials {
  senha: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.token) {
      sessionStorage.setItem('brito-admin-token', response.data.token);
    }

    return response.data;
  },

  logout(): void {
    sessionStorage.removeItem('brito-admin-token');
  },

  isAuthenticated(): boolean {
    return Boolean(sessionStorage.getItem('brito-admin-token'));
  },

  getToken(): string | null {
    return sessionStorage.getItem('brito-admin-token');
  }
};