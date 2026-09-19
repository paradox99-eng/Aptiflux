import { NextResponse } from 'next/server';
import { verifySession } from './session';

/**
 * A wrapper for API routes to handle try/catch and authentication uniformly.
 * @param {Function} handler - The main route handler function (receives request, context, and session).
 * @param {Object} options - Configuration options.
 * @param {boolean} options.requireAuth - Whether to enforce session authentication (default: true).
 * @returns {Function} Next.js API route function.
 */
export function apiHandler(handler, { requireAuth = true } = {}) {
  return async (request, context) => {
    try {
      let session = null;
      
      if (requireAuth) {
        session = await verifySession();
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      // Execute the actual handler, passing request, context, and session
      return await handler(request, context, session);

    } catch (error) {
      console.error('API Error:', error);
      
      // Handle known error structures if needed, otherwise fallback to 500
      const status = error.status || 500;
      const message = error.message || 'Internal Server Error';
      
      return NextResponse.json({ error: message }, { status });
    }
  };
}
