import { mount } from "cypress/react";

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      tab: typeof tab;
      useForm: (file: string) => void;
      visitForm: (formID: string) => void;
      visitPage: (path: string) => void;
      login: () => void;
      logout: () => void;
      useFlag: (flagName: string, value: boolean, alreadyAuth?: boolean) => void;
    }
  }
}
