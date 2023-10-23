export interface ResponseSubmission {
  id: string;
  created_at: number;
  confirmation_code: string;
  [key: string]: string | number;
}
