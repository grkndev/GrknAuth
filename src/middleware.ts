import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/auth/login(.*)',
  '/auth/logout(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const isAuthenticated = !!userId
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  
  // Allow the request to proceed
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}