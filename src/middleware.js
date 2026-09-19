import { NextResponse } from 'next/server';
import { verifySession } from './lib/session';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  const isAdminRoute = path.startsWith('/admin') || path.startsWith('/api/admin');
  
  if (isAdminRoute) {
    const session = await verifySession();
    
    // Check if authenticated and if role is admin
    if (!session || session.role !== 'admin') {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
