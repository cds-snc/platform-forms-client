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
