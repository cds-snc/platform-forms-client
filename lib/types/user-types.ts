export interface FormOwner {
  id: string;
  email: string;
  active: boolean;
}

export enum UserRole {
  PROGRAM_ADMINISTRATOR = "program_administator",
}
