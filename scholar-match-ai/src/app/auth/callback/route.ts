import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/dashboard';
  url.search = '';
  return NextResponse.redirect(url);
}