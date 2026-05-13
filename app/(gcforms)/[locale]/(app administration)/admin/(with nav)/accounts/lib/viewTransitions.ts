export const getAccountIdentityTransitionName = (userId: string) => `account-identity-${userId}`;

export const accountsRouteTransition = {
  enter: {
    "nav-forward": "accounts-nav-forward",
    "nav-back": "accounts-nav-back",
    default: "none",
  },
  exit: {
    "nav-forward": "accounts-nav-forward",
    "nav-back": "accounts-nav-back",
    default: "none",
  },
  default: "none",
} as const;
