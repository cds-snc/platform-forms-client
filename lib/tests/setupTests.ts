import "jest-chain";
import "@testing-library/jest-dom";

jest.mock("next/config", () => () => ({
  publicRuntimeConfig: {
    isProduction: false,
  },
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
    };
  },
}));

process.env.AWS_ACCESS_KEY_ID="test_key"
process.env.AWS_SECRET_ACCESS_KEY="testkeyG"
process.env.AWS_BUCKET_NAME="fileUploadBucket"
process.env.AWS_BUCKET_REGION="ca-central-1"