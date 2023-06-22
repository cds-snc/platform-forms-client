import { Privilege } from "@prisma/client";

export interface FormOwner {
  id: string;
  email: string;
  name: string;
  active: boolean;
}

export interface DBUser {
  privileges: Privilege[];
  id: string;
  name: string | null;
  email: string | null;
  active: boolean;
}
