export interface User {
  id: number;
  email: string;
  is_active: boolean;
}

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: number;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
