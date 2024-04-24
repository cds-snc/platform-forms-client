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
import ShareForm from "./authenticatedFlows/share";
import SetupSecurityQuestions from "./authenticatedFlows/setup_security_questions_page";

describe("Authentication Paths", () => {
  AcceptableUse();
  LoginPageSuite();
  DeactivatedUserPage();
  SetupSecurityQuestions();
});

describe("Authenticated User Suite", () => {
  describe("Application Flows Regular User", () => {
    // Get the JWT Session Token from the cookie
    before(() => {
      cy.userSession({ admin: false, acceptableUse: true });
    });

    ProfileRegularUser();
    FormOwnership();
    FormBuilderNamesAndTitle();
    ShareForm();
  });

  describe("Application Flows Admin User", () => {
    // Get the JWT Session Token from the cookie
    before(() => {
      cy.userSession({ admin: true, acceptableUse: true });
    });

    ProfileAdminUser();
    FormOwnershipAdmin();
    AccountsPage();
  });
});
