import type { NextAuthOptions, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// ── NextAuth type extensions ───────────────────────────────────────────────
declare module 'next-auth' {
    interface User { backendToken?: string; }
    interface Session {
        user: User & { id?: string; backendToken?: string };
    }
}
declare module 'next-auth/jwt' {
    interface JWT { id?: string; backendToken?: string; }
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    const res = await fetch(`${API}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
                    });
                    const data = await res.json();
                    if (!res.ok) return null;
                    return {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        image: data.user.image || null,
                        backendToken: data.token,
                    } as User;
                } catch {
                    return null;
                }
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                try {
                    const res = await fetch(`${API}/auth/google`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: user.name, email: user.email, image: user.image }),
                    });
                    if (!res.ok) return false;
                    const data = await res.json();
                    user.backendToken = data.token;
                    user.id = data.user.id;
                } catch {
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id;
                token.backendToken = user.backendToken;
                token.picture = user.image ?? undefined;
            }
            return token;
        },

        async session({ session, token }) {
            // token.id and token.backendToken are `string | undefined`;
            // the session.user fields are `id?: string` — use ?? to satisfy strict assignment
            if (token.id) session.user.id = token.id;
            if (token.backendToken) session.user.backendToken = token.backendToken;
            return session;
        },
    },

    pages: { signIn: '/auth/login' },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET!,
};
