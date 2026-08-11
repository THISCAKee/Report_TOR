export const AUTH_EMAIL_DOMAIN = "gmail.com";

export function usernameToAuthEmail(value: string) {
  const username = value.trim().toLowerCase();
  return username.includes("@") ? username : `${username}@${AUTH_EMAIL_DOMAIN}`;
}
