export interface FormOwner {
  id: string;
  email: string;
  active: boolean;
}

export enum UserRole {
  Administrator = "administrator",
  ProgramAdministrator = "program_administrator",
}
