import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the request is for the admin panel
  if (request.nextUrl.pathname.startsWith("/admin-panel")) {
    const authorizationHeader = request.headers.get("authorization")

    // If no authorization header is present, prompt for credentials
    if (!authorizationHeader) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      })
    }

    // Decode the base64 credentials
    const [authType, base64Credentials] = authorizationHeader.split(" ")

    if (authType !== "Basic" || !base64Credentials) {
      return new NextResponse("Invalid Authorization header", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      })
    }

    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8")
    const [username, password] = credentials.split(":")

    // !!! WARNING: This is highly insecure for production environments. !!!
    // Hardcoding credentials is not recommended. Use a proper authentication system.
    if (username === "ilian" && password === "ilian123") {
      return NextResponse.next()
    } else {
      return new NextResponse("Invalid credentials", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      })
    }
  }

  // Allow all other requests to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
