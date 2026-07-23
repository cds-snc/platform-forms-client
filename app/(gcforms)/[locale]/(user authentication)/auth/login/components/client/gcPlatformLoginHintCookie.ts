import { GC_PLATFORM_LOGIN_HINT_COOKIE, GC_PLATFORM_LOGIN_HINT_VALUE } from "@root/constants";
import { SetCookie, stringifySetCookie } from "cookie";

export const createGcPlatformLoginHintCookie = () => {
  const cookieValue: SetCookie = {
    name: GC_PLATFORM_LOGIN_HINT_COOKIE,
    value: GC_PLATFORM_LOGIN_HINT_VALUE,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: true,
  };

  return stringifySetCookie(cookieValue);
};

export const createClearGcPlatformLoginHintCookie = () => {
  const cookieValue: SetCookie = {
    name: GC_PLATFORM_LOGIN_HINT_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
    sameSite: true,
  };

  return stringifySetCookie(cookieValue);
};
