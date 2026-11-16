import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAlbanaPath } from "./lib/albana-routes";
import { authRedirect } from "./lib/auth-redirect";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!isAlbanaPath(pathname)) return new NextResponse(null, { status: 404 });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!isAdminArea && pathname !== "/login") return response;

  // Local JWT verify (also refreshes the session cookie). On /admin only "signed in" is checked here;
  // admin_users is enforced by requireAdminMember() in the admin layout, pages and actions.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  let isAdmin = false;
  if (userId && pathname === "/login") {
    const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
    isAdmin = Boolean(admin);
  }

  const target = authRedirect(pathname, { signedIn: Boolean(userId), isAdmin });
  if (!target) return response;
  const redirect = NextResponse.redirect(new URL(target, request.url));
  // Keep any refreshed session cookies on the redirect.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = { matcher: ["/((?!_next/static|_next/image|.*\\..*|favicon.ico).*)"] };
