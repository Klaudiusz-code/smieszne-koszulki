/**
 * Funkcje zależne od opcjonalnych wtyczek WordPress są domyślnie ukryte.
 * Można je włączyć po instalacji JWT Authentication.
 */
export const ACCOUNT_FEATURES_ENABLED =
  process.env.NEXT_PUBLIC_ACCOUNT_FEATURES_ENABLED === "true";
