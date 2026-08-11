export const AUTH_EMAIL_DOMAIN = "report-tor.local";

export function usernameToAuthEmail(value: string) {
  const username = value.trim().toLowerCase();
  return username.includes("@") ? username : `${username}@${AUTH_EMAIL_DOMAIN}`;
}
