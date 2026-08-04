// Helper to map AddressComplete server error codes to localized messages
export function mapAddressCompleteError(
  error: string | null | undefined,
  t: (key: string) => string
): string | null {
  if (!error) return null;

  switch (error) {
    case "API_KEY_MISSING":
      return t("addElementDialog.addressComplete.apiKeyMissing");
    case "API_KEY_INVALID":
      return t("addElementDialog.addressComplete.apiKeyInvalid");
    case "NETWORK_ERROR":
      return t("addElementDialog.addressComplete.networkError");
    default:
      return t("addElementDialog.addressComplete.serviceUnavailable");
  }
}
