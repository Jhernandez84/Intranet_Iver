import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "./app/lib/supabase/middleware";

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

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // 0) Deja pasar la página pública de formularios (/forms/f/[slug]) sin
  // validar sesión — comprobación por segmento exacto, no por prefijo, para
  // no capturar accidentalmente otras rutas de /forms/*.
  const segments = pathname.split("/").filter(Boolean);
  const isPublicForm = segments[0] === "forms" && segments[1] === "f";
  if (isPublicForm) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(req);

  const hasCode = url.searchParams.has("code");

  // 1) Sesión (getUser revalida contra Supabase Auth y refresca la cookie;
  // getSession solo leería la cookie, posiblemente vieja)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay sesión:
  // - deja pasar si viene con ?code (OAuth en proceso)
  // - si no, redirige al home (o /login si prefieres)
  if (!user) {
    if (hasCode) return response;
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2) Access list desde user_metadata
  const rawAccess = user.user_metadata?.access;
  const accessList: string[] = Array.isArray(rawAccess) ? rawAccess : [];

  // Si no hay permisos definidos, no autorizado
  if (accessList.length === 0) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 3) Determinar la "app" desde el primer segmento
  //    /finances/x/y  -> "finances"
  const app = (segments[0] ?? "").toLowerCase();

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

  return response;
}
