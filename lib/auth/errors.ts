// Creates a new custom Error Class
export class AccessControlError extends Error {
  public user: {
    id: string;
  };

  constructor(userId: string, message: string = "AccessControlError") {
    super(message);
    Object.setPrototypeOf(this, AccessControlError.prototype);
    this.user = {
      id: userId,
    };
  }
}
