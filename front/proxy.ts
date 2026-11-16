import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAlbanaPath } from "./lib/albana-routes";

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

  if (pathname === "/login" || pathname === "/" || pathname.startsWith("/program") || pathname.startsWith("/artikel") || pathname.startsWith("/register")) return response;
  if (!pathname.startsWith("/admin")) return response;

  // Signed-in check only (local JWT verify, also refreshes the session cookie).
  // admin_users is enforced once per request by requireAdminMember() in the admin layout, pages and actions.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) return NextResponse.redirect(new URL("/login", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|.*\\..*|favicon.ico).*)"] };
