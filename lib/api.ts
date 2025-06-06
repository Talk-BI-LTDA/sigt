export const API_CONFIG = {
  BASE_URL: "https://api.sigt.com.br",
};

// Types baseados na resposta real da sua API
export interface User {
  id: string;
  displayId: number;
  formattedId: string;
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  approvedDate: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  backendTokens: BackendTokens;
  user: User;
  driver?: Driver; // Se for motorista
}

export interface Driver {
  id: string;
  displayId: number;
  formattedId: string;
  driverLicenseNumber: string;
  driverLicenseExpiration: string;
  status: "ACTIVE" | "INACTIVE";
  userId: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Tipos para documentos e cursos
export interface DocumentType {
  id: string;
  displayId: number;
  documentType: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CourseType {
  id: string;
  displayId: number;
  courseName: string;
  status: "ACTIVE" | "INACTIVE";
}
