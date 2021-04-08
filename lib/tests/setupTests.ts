import "jest-chain";
import "@testing-library/jest-dom";

jest.mock("next/config", () => () => ({
  publicRuntimeConfig: {
    isProduction: false,
  },
}));
