import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Ton domaine principal en local ou en prod (ex: localhost:3000)
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "localhost:3000";

  // 1. Accès direct au site principal (ex: localhost:3000 ou monsite.com)
  if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
    return NextResponse.next();
  }

  // 2. Offre GRATUITE : Sous-domaine (ex: client.localhost:3000)
  if (hostname.endsWith(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, "");
    return NextResponse.rewrite(new URL(`/site/subdomain/${subdomain}${url.pathname}`, req.url));
  }

  // 3. Offre PRO : Domaine personnalisé .com (ex: ledomaine.com)
  return NextResponse.rewrite(new URL(`/site/custom/${hostname}${url.pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};