import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  const form = await request.formData();
  const userId = String(form.get("userId") ?? "");
  const user = await findUserById(userId);

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(AUTH_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
