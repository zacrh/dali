// https://stackoverflow.com/a/76749457
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = !!req.cookies.get("next-auth.session-token")

  if (!session) {
    return NextResponse.redirect(new URL(`/api/auth/signin?callbackUrl=${path}`, req.url)); // Will redirect to `/login` login page
  }
  return NextResponse.next();
}

export const config = { matcher: [] }