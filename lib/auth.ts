import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { ApiResponse, AuthPayload } from "@/lib/types";

const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_BASEURL ||
  process.env.NEXTPUBLICBASEURL ||
  "";

const API_BASE_URL = RAW_API_BASE_URL.endsWith("/api/v1")
  ? RAW_API_BASE_URL
  : `${RAW_API_BASE_URL.replace(/\/$/, "")}/api/v1`;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>;

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to refresh token");
    }

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      accessTokenExpires: Date.now() + 14 * 60 * 1000,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          cache: "no-store",
        });

        const data = (await response.json()) as ApiResponse<AuthPayload>;

        if (!response.ok || !data.success || data.data.user.role !== "admin") {
          throw new Error(data.message || "Invalid credentials");
        }

        return {
          id: data.data.user._id,
          name: data.data.user.name,
          email: data.data.user.email,
          image: data.data.user.avatar,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          accessTokenExpires: Date.now() + 14 * 60 * 1000,
          user: data.data.user,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          user: user.user,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      session.user = token.user;
      return session;
    },
  },
};
