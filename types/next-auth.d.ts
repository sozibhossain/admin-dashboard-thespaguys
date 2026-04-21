import "next-auth";
import "next-auth/jwt";
import type { User as AppUser } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
    user: AppUser;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    user: AppUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    user: AppUser;
    error?: string;
  }
}
