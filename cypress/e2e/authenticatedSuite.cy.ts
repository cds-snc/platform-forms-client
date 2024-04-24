// A Testing Suite for all Authenticated User Tests

import LoginPageSuite from "./authenticatedFlows/login_page";
import AcceptableUse from "./authenticatedFlows/acceptable_use";
import DeactivatedUserPage from "./authenticatedFlows/accounts_deactivated";
import {
  ProfileRegularUser,
  ProfileAdminUser,
} from "./authenticatedFlows/your_account_user_profile";
import { FormOwnership, FormOwnershipAdmin } from "./authenticatedFlows/ownership";
import FormBuilderNamesAndTitle from "./authenticatedFlows/names-and-titles";
import AccountsPage from "./authenticatedFlows/accounts_page";

let userSessionToken: string;
let adminSessionToken: string;

describe("Authentication Paths", () => {
  LoginPageSuite();
  AcceptableUse();
  DeactivatedUserPage();
});

describe("Authenticated User Suite", () => {
  describe("Application Flows Regular User", () => {
    // Get the JWT Session Token from the cookie
    before(() => {
      cy.login({ acceptableUse: true });
      cy.getCookie("authjs.session-token").then((cookie) => {
        if (cookie?.value) {
          userSessionToken = cookie?.value;
        }
      });
    });

    // Reuse the same JWT session token for all tests
    beforeEach(() => {
      cy.setCookie("authjs.session-token", userSessionToken);
    });

    ProfileRegularUser();
    FormOwnership();
    FormBuilderNamesAndTitle();
  });

  describe("Application Flows Admin User", () => {
    // Get the JWT Session Token from the cookie
    before(() => {
      cy.login({ admin: true, acceptableUse: true });
      cy.getCookie("authjs.session-token").then((cookie) => {
        if (cookie?.value) {
          adminSessionToken = cookie?.value;
        }
      });
    });

    // Reuse the same JWT session token for all tests
    beforeEach(() => {
      cy.setCookie("authjs.session-token", adminSessionToken);
    });

    ProfileAdminUser();
    FormOwnershipAdmin();
    AccountsPage();
  });
});
