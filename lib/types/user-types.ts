import { User } from "@prisma/client";

export interface FormOwner {
  id: string;
  email: string;
  name?: string;
  active: boolean;
}

export interface AppUser extends Omit<User, "image" | "emailVerified" | "lastLogin"> {
  privileges: {
    id: string;
    name: string;
    descriptionEn: string | null;
    descriptionFr: string | null;
  }[];
}
