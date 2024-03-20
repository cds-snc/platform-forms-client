jest.mock("app/(gcforms)/[locale]/(form filler)/id/[...props]/actions", () => ({
  __esModule: true,
  submitForm: jest.fn(),
}));
