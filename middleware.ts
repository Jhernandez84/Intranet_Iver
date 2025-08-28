// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// // export const config = {
// //   matcher: ["/finances/:path*", "/admin/:path*", "/dashboard/:path*", "/coffee/:path*"], // y más si necesitas
// // };

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });

//   const url = req.nextUrl;
//   const hasCode = url.searchParams.has("code");

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   // 👇 Permitir pasar si viene con ?code= (OAuth en proceso)
//   if (!session && url.pathname.startsWith("/myaccount") && !hasCode) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return res;
// }

// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// 💡 Solo rutas protegidas (tu selección)
export const config = {
  matcher: [
    "/finances/:path*",
    "/dbadmin/:path*",
    "/ministries/:path*",
    "/dashboard/:path*",
    "/leadership/:path*",
    "/coffee/:path*",
    "/secretary/:path*",
    "/forms/:path*",
    "/calendar/:path*",
    "/rooms/:path*",
  ],
};

// 👇 prefijos que deben ser SIEMPRE públicos (sin login)
const PUBLIC_SUBPATHS = [
  "/forms/live", // incluye /forms/liveforms y cualquier subruta
  "/forms/workspace/", // incluye /forms/liveforms y cualquier subruta
  // agrega más si necesitas, p.ej:
  // "/calendar/public",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // 0) Deja pasar subrutas públicas sin validar nada
  if (PUBLIC_SUBPATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const hasCode = url.searchParams.has("code");

  // 1) Sesión
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Si no hay sesión:
  // - deja pasar si viene con ?code (OAuth en proceso)
  // - si no, redirige al home (o /login si prefieres)
  if (!session) {
    if (hasCode) return res;
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2) Access list desde user_metadata
  const rawAccess = session.user.user_metadata?.access;
  console.log("accesos en metadata", rawAccess);
  const accessList: string[] = Array.isArray(rawAccess) ? rawAccess : [];

  // Si no hay permisos definidos, no autorizado
  if (accessList.length === 0) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 3) Determinar la "app" desde el primer segmento
  //    /finances/x/y  -> "finances"
  const firstSegment = url.pathname.split("/").filter(Boolean)[0] ?? "";
  const app = firstSegment.toLowerCase();

  // 4) Regla: acceso si
  //   - la lista incluye el nombre de la app, o
  //   - hay comodín global "*" o un wildcard de rol "admin:*" que habilite todo admin
  const hasAccess =
    accessList.includes(app) ||
    accessList.includes("*") ||
    (app.startsWith("admin") && accessList.includes("admin:*"));

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return res;
}
