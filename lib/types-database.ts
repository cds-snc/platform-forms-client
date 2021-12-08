export interface formUser {
  id: number;
  template_id: number;
  email: string;
  temporary_token: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
