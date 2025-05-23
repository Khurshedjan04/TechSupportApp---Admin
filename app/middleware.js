"use client";
import { NextResponse } from "next/server";

export function middleware(request) {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
