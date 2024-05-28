jest.mock("app/(gcforms)/[locale]/(form filler)/id/[...props]/actions", () => ({
  __esModule: true,
  submitForm: jest.fn(),
}));

jest.mock("@formBuilder/actions", () => ({
  __esModule: true,
  getTranslatedElementProperties: jest.fn(),
}));

jest.mock("@formBuilder/actions", () => ({
  __esModule: true,
  getTranslatedProperties: jest.fn(),
}));

jest.mock("@formBuilder/actions", () => ({
  __esModule: true,
  checkFlag: jest.fn(),
}));

jest.mock("@lib/actions/auth", () => ({
  __esModule: true,
  authCheckAndThrow: jest.fn(),
  authCheckAndRedirect: jest.fn(),
}));
