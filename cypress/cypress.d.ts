import { mount } from "cypress/react";

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      tab: typeof tab;
      useForm: (file: string) => Chainable<void>;
      visitForm: (formID: string) => Chainable<Window>;
      visitPage: (path: string) => Chainable<Window>;
      securityQuestions: () => Chainable<void>;
      login: ({
        admin,
        acceptableUse,
      }?: {
        admin?: boolean;
        acceptableUse?: boolean;
      }) => Chainable<void>;
      logout: () => Chainable<void>;
      useFlag: (flagName: string, value: boolean, alreadyAuth?: boolean) => Chainable<void>;
      selection: (fn: (el: JQuery<HTMLElement>) => void) => Chainable<JQuery<HTMLElement>>;
      setSelection: (
        query:
          | string
          | {
              anchorQuery: string;
              anchorOffset?: number;
              focusQuery?: string;
              focusOffset?: number;
            }
      ) => Chainable<JQuery<HTMLElement>>;
      setCursor: (query: string, atStart?: boolean) => Chainable<void>;
      setCursorBefore: (query: string) => Chainable<void>;
      setCursorAfter: (query: string) => Chainable<void>;
      resetDB: () => Chainable<void>;
      resetFlags: () => Chainable<void>;
      resetAll: () => Chainable<void>;
    }
  }
}
