import { redirect } from "next/navigation";
import { getCurrentLanguage } from "@i18n";
import { auth } from "@lib/auth/nextAuth";
import { JSX } from "react";
import { Session } from "next-auth";

type WithSession<T> = T & { session: Session };
type Layout = {
  children: React.ReactNode;
  params: Promise<{ [key: string]: string | string[]; locale: string }>;
};
type Page = {
  params: Promise<{ [key: string]: string | string[]; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export function AuthenticatedPage(
  page: (props: WithSession<Page>) => Promise<JSX.Element>
): (props: WithSession<Page>) => Promise<JSX.Element>;
export function AuthenticatedPage(
  authorizations: (() => Promise<unknown>)[],
  page: (props: WithSession<Page>) => Promise<JSX.Element>
): (props: WithSession<Page>) => Promise<JSX.Element>;
export function AuthenticatedPage(
  arg1: (() => Promise<unknown>)[] | ((props: WithSession<Page>) => Promise<JSX.Element>),
  arg2?: (props: WithSession<Page>) => Promise<JSX.Element>
): (props: WithSession<Page>) => Promise<JSX.Element> {
  return async (props: WithSession<Page>) => {
    const session = await auth();
    const language: string = await getCurrentLanguage();
    if (session === null) {
      redirect(`/${language}/auth/login`);
    }
    props.session = session;
    if (typeof arg1 === "function") {
      return arg1(props);
    } else {
      if (arg2 === undefined) {
        throw new Error("Page function is undefined");
      }
      await Promise.all(arg1.map((authorization) => authorization())).catch(() => {
        // redirect to unauthorized page
        redirect(`/${language}/unauthorized`);
      });
      return arg2(props);
    }
  };
}

// Creating a second function that seperates the concern for Layouts
// in case we need to change or tweak implementation between pages and layouts in the future.

export function AuthenticatedLayout(
  page: (props: WithSession<Layout>) => Promise<JSX.Element>
): (props: WithSession<Layout>) => Promise<JSX.Element>;
export function AuthenticatedLayout(
  authorizations: (() => Promise<unknown>)[],
  page: (props: WithSession<Layout>) => Promise<JSX.Element>
): (props: WithSession<Layout>) => Promise<JSX.Element>;
export function AuthenticatedLayout(
  arg1: (() => Promise<unknown>)[] | ((props: WithSession<Layout>) => Promise<JSX.Element>),
  arg2?: (props: WithSession<Layout>) => Promise<JSX.Element>
) {
  return async (props: WithSession<Layout>) => {
    const session = await auth();
    const language: string = await getCurrentLanguage();
    if (session === null) {
      redirect(`/${language}/auth/login`);
    }
    props.session = session;
    if (typeof arg1 === "function") {
      return arg1(props);
    } else {
      if (arg2 === undefined) {
        throw new Error("Page function is undefined");
      }
      await Promise.all(arg1.map((authorization) => authorization())).catch(() => {
        // redirect to unauthorized page
        redirect(`/${language}/unauthorized`);
      });
      return arg2(props);
    }
  };
}
