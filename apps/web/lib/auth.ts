import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { AuthSuccessSchema, LoginSchema } from "@aquora/shared";

import { apiRequest } from "./api-client";

const AuthResponseSchema = z.object({
  success: z.literal(true),
  data: AuthSuccessSchema
});

type AuthResponse = z.infer<typeof AuthResponseSchema>;

function decodeJwtExpiry(accessToken: string) {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    const json = JSON.parse(decoded) as { exp?: number };
    if (!json.exp) return null;
    return json.exp * 1000;
  } catch {
    return null;
  }
}

async function loginWithCredentials(input: z.infer<typeof LoginSchema>) {
  try {
    const { response, json } = await apiRequest<AuthResponse>("/login", {
      method: "POST",
      headers: {
        "x-auth-return-refresh-token": "true"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) return null;

    const parsed = AuthResponseSchema.safeParse(json);
    if (!parsed.success) return null;

    return parsed.data.data;
  } catch {
    return null;
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshTokenMissing" };
  }

  try {
    const { response, json } = await apiRequest<AuthResponse>("/refresh", {
      method: "POST",
      headers: {
        "x-auth-return-refresh-token": "true"
      },
      body: JSON.stringify({ refreshToken: token.refreshToken })
    });

    if (!response.ok) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const parsed = AuthResponseSchema.safeParse(json);
    if (!parsed.success) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const authData = parsed.data.data;
    const expiresAt = decodeJwtExpiry(authData.accessToken) ?? Date.now() + 15 * 60 * 1000;

    return {
      ...token,
      accessToken: authData.accessToken,
      accessTokenExpires: expiresAt,
      refreshToken: authData.refreshToken ?? token.refreshToken,
      user: {
        id: authData.user.id,
        name: authData.user.name,
        role: authData.user.role,
        mobileNumber: authData.user.mobileNumber
      }
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        mobileNumber: { label: "Mobile number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse({
          mobileNumber: credentials?.mobileNumber,
          password: credentials?.password
        });
        if (!parsed.success) return null;

        const authData = await loginWithCredentials(parsed.data);
        if (!authData) return null;

        const expiresAt = decodeJwtExpiry(authData.accessToken) ?? Date.now() + 15 * 60 * 1000;

        return {
          id: authData.user.id,
          name: authData.user.name,
          role: authData.user.role,
          mobileNumber: authData.user.mobileNumber,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          accessTokenExpires: expiresAt
        };
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            mobileNumber: user.mobileNumber
          }
        };
      }

      if (token.accessToken && token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken ?? '';
      session.error = token.error ?? '';
      return session;
    }
  }
};
