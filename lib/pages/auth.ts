import { redirect } from "next/navigation";
import { getCurrentLanguage } from "@i18n";
import { auth } from "@lib/auth/nextAuth";

export function AuthenticatedPage<Input extends unknown[], R>(
  page: (...args: Input) => Promise<R>
): typeof page;
export function AuthenticatedPage<Input extends unknown[], R>(
  authorizations: (() => Promise<unknown>)[],
  page: (...args: Input) => Promise<R>
): typeof page;
export function AuthenticatedPage<Input extends unknown[], R>(
  arg1: (() => Promise<unknown>)[] | ((...args: Input) => Promise<R>),
  arg2?: (...args: Input) => Promise<R>
): (...args: Input) => Promise<R> {
  return async (...args: Input) => {
    const session = await auth();
    const language: string = await getCurrentLanguage();
    if (session === null) {
      redirect(`/${language}/auth/login`);
    }
    if (typeof arg1 === "function") {
      return arg1(...args);
    } else {
      if (arg2 === undefined) {
        throw new Error("Page function is undefined");
      }
      await Promise.all(arg1.map((authorization) => authorization())).catch(() => {
        // redirect to unauthorized page
        redirect(`/${language}/unauthorized`);
      });
      return arg2(...args);
    }
  };
}

// Creating a second function that seperates the concern for Layouts
// in case we need to change or tweak implementation between pages and layouts in the future.

export function AuthenticatedLayout<Input extends unknown[], R>(
  page: (...args: Input) => Promise<R>
): (...args: Input) => Promise<R>;
export function AuthenticatedLayout<Input extends unknown[], R>(
  authorizations: (() => Promise<unknown>)[],
  page: (...args: Input) => Promise<R>
): (...args: Input) => Promise<R>;
export function AuthenticatedLayout<Input extends unknown[], R>(
  arg1: (() => Promise<unknown>)[] | ((...args: Input) => Promise<R>),
  arg2?: (...args: Input) => Promise<R>
) {
  if (typeof arg1 === "function") {
    return AuthenticatedPage(arg1);
  } else {
    if (arg2 === undefined) {
      throw new Error("Page function is undefined");
    }
    return AuthenticatedPage(arg1, arg2);
  }
}
