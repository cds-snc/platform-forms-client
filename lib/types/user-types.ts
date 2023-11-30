import { Privilege, User } from "@prisma/client";

export interface FormOwner {
  id: string;
  email: string;
  name?: string;
  active: boolean;
}

export interface DBUser extends User {
  privileges: Privilege[];
}
