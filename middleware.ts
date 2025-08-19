import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// export const config = {
//   matcher: ["/(protected)/:path*"],
// };

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const url = req.nextUrl;
  const hasCode = url.searchParams.has("code");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 👇 Permitir pasar si viene con ?code= (OAuth en proceso)
  if (!session && url.pathname.startsWith("/dashboard") && !hasCode) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}
