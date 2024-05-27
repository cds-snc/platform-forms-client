import "client-only";

export const useSessionCookie = () => {
  if (document.cookie.includes("authjs.session-token")) {
    return true;
  }

  return false;
};
