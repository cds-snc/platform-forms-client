import { getAbility } from "@lib/privileges";
// Creates a new custom Error Class
export class AccessControlError extends Error {
  public user: {
    id: Promise<string>;
  } = {
    id: getAbility()
      .then((ability) => ability.user.id)
      .catch(() => "unauthenticated"),
  };

  constructor(message: string = "AccessControlError") {
    super(message);
    Object.setPrototypeOf(this, AccessControlError.prototype);
  }
}
