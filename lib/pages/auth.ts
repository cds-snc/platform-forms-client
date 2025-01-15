import { redirect } from "next/navigation";
import { getCurrentLanguage } from "@i18n";
import { auth } from "@lib/auth/nextAuth";
import { JSX } from "react";
import { Session } from "next-auth";

type WithSession<T> = T & { session: Session };
type Layout<T> = {
  children: React.ReactNode;
  params: Promise<{ [key: string]: string | string[]; locale: string } & T>;
};
type Page<T> = {
  params: Promise<{ [key: string]: string | string[]; locale: string } & T>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export function AuthenticatedPage<T>(
  page: (props: WithSession<Page<T>>) => Promise<JSX.Element>
): (props: WithSession<Page<T>>) => Promise<JSX.Element>;
export function AuthenticatedPage<T>(
  authorizations: (() => Promise<unknown>)[],
  page: (props: WithSession<Page<T>>) => Promise<JSX.Element>
): (props: WithSession<Page<T>>) => Promise<JSX.Element>;
export function AuthenticatedPage<T>(
  arg1: (() => Promise<unknown>)[] | ((props: WithSession<Page<T>>) => Promise<JSX.Element>),
  arg2?: (props: WithSession<Page<T>>) => Promise<JSX.Element>
): (props: WithSession<Page<T>>) => Promise<JSX.Element> {
  return async (props: WithSession<Page<T>>) => {
    const session = await auth();
    const language: string = await getCurrentLanguage();
    if (session === null) {
      redirect(`/${language}/auth/login`);
    }

    if (typeof arg1 === "function") {
      return arg1({ ...props, session });
    } else {
      if (arg2 === undefined) {
        throw new Error("Page function is undefined");
      }
      await Promise.all(arg1.map((authorization) => authorization())).catch(() => {
        // redirect to unauthorized page
        redirect(`/${language}/unauthorized`);
      });
      return arg2({ ...props, session });
    }
  };
}

// Creating a second function that seperates the concern for Layouts
// in case we need to change or tweak implementation between pages and layouts in the future.

export function AuthenticatedLayout<T>(
  page: (props: WithSession<Layout<T>>) => Promise<JSX.Element>
): (props: WithSession<Layout<T>>) => Promise<JSX.Element>;
export function AuthenticatedLayout<T>(
  authorizations: (() => Promise<unknown>)[],
  page: (props: WithSession<Layout<T>>) => Promise<JSX.Element>
): (props: WithSession<Layout<T>>) => Promise<JSX.Element>;
export function AuthenticatedLayout<T>(
  arg1: (() => Promise<unknown>)[] | ((props: WithSession<Layout<T>>) => Promise<JSX.Element>),
  arg2?: (props: WithSession<Layout<T>>) => Promise<JSX.Element>
) {
  return async (props: WithSession<Layout<T>>) => {
    const session = await auth();
    const language: string = await getCurrentLanguage();
    if (session === null) {
      redirect(`/${language}/auth/login`);
    }
    if (typeof arg1 === "function") {
      return arg1({ ...props, session });
    } else {
      if (arg2 === undefined) {
        throw new Error("Page function is undefined");
      }
      await Promise.all(arg1.map((authorization) => authorization())).catch(() => {
        // redirect to unauthorized page
        redirect(`/${language}/unauthorized`);
      });
      return arg2({ ...props, session });
    }
  };
}
