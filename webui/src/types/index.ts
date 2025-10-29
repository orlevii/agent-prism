// Example types - add your application types here

export interface User {
  id: string;
  name: string;
  email: string;
}

export type Theme = 'light' | 'dark';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
