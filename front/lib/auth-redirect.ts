// Proxy redirect rules for the CMS. A signed-in non-admin is left on /login so /login ↔ /admin cannot loop;
// the admin guard sends that user back to /login as well.
export function authRedirect(pathname: string, session: { signedIn: boolean; isAdmin: boolean }): "/login" | "/admin" | null {
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminArea && !session.signedIn) return "/login";
  if (pathname === "/login" && session.signedIn && session.isAdmin) return "/admin";
  return null;
}
