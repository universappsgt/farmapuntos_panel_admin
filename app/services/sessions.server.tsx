import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { User } from "firebase/auth"
import { createThemeSessionResolver } from "remix-themes"
import { logoutUser } from "./firebase-auth.server"

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === "production"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["s3cr3t"],
    // Set secure only if in production (HTTPS)
    // Don't set domain to allow cookies to work on any subdomain (like Vercel)
    ...(isProduction ? { secure: true } : {}),
  },
})

export async function createUserSession(user: User, redirectTo: string) {
  const session = await sessionStorage.getSession()
  session.set("user", user)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  })
}

export async function destroyUserSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  )
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  })
}

export async function signOutUser(request: Request) {
  await logoutUser()
  return destroyUserSession(request)
}

export const themeSessionResolver = createThemeSessionResolver(sessionStorage)

export async function getSessionUser(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  )
  const user = session.get("user") as User | undefined
  return user ?? null
}
