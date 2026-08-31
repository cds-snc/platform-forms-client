const maxAge = 0;

export const gcFormsAuthorizationParamsLogin = {
  max_age: maxAge,
  prompt: "select_account",
} as const;

export const gcFormsAuthorizationParamsRegister = {
  max_age: maxAge,
  prompt: "create",
} as const;
