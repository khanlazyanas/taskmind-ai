import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Ye routes public rahenge, baaki sab protected ho jayenge
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhook(.*)'])

// NAYA UPDATE: Yahan 'async' lagana zaroori hai
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // NAYA UPDATE: auth().protect() ki jagah 'await auth.protect()' likhna hai
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}