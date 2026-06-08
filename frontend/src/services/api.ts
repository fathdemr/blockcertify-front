import axios from 'axios';
import type { Diploma, University, VerifyResult } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? '';

// Public routes: /exapi/...
const exapi = axios.create({
  baseURL: `${BASE}/exapi`,
  withCredentials: true,
});

// Private routes: /api/...
const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
});

export function setAuthToken(token: string | null) {
  if (token) {
    exapi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('bc_token', token);
  } else {
    delete exapi.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('bc_token');
  }
}

// Restore token on page load
const savedToken = localStorage.getItem('bc_token');
if (savedToken) setAuthToken(savedToken);

export const authApi = {
  login: (email: string, password: string) =>
    exapi.post('/user/login', { email, password }),

  register: (firstName: string, lastName: string, email: string, password: string) =>
    exapi.post('/user/register/admin', { FirstName: firstName, LastName: lastName, email, password }),

  logout: () =>
    exapi.post('/user/logout'),
};

export const diplomaApi = {
  upload: (formData: FormData) =>
    api.post<Diploma>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  verify: (diplomaId: string) =>
    api.post<VerifyResult>('/verify', { diplomaId }),

  getAll: () =>
    api.get<Diploma[]>('/records'),

  getById: (id: number) =>
    api.get<Diploma>(`/records/${id}`),
};

export const universityApi = {
  getAll: () =>
    exapi.get<University[]>('/universities'),
};

export const facultyApi = {
  getByUniversity: (universityId: string) =>
    exapi.get('/faculties', { params: { university_id: universityId } }),
};

export const departmentApi = {
  getByFaculty: (facultyId: string) =>
    exapi.get('/departments', { params: { faculty_id: facultyId } }),
};

export const walletApi = {
  getStatus: () =>
    api.get('/wallet/status'),
};

export const userApi = {
  getMe: () =>
    exapi.get('/user/me'),

  updateMe: (data: { firstName?: string; lastName?: string; password?: string }) =>
    exapi.put('/user/me', data),
};

export default api;
