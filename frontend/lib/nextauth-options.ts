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

// BACKEND_API_URL is a server-only env var (no NEXT_PUBLIC_ prefix).
// NEXT_PUBLIC_API_URL is baked in at build time for client-side code only;
// it is NOT reliably available inside server-side NextAuth callbacks on Vercel.
// Set BACKEND_API_URL = https://tripmind-uvwj.onrender.com on Vercel as a plain env var.
const API = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                const loginUrl = `${API}/auth/login`;
                console.log('[NextAuth] authorize → calling', loginUrl);

                let res: Response;
                try {
                    res = await fetch(loginUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });
                } catch (networkErr) {
                    console.error('[NextAuth] Network error reaching backend:', networkErr);
                    throw new Error('Cannot reach the server. Please try again.');
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let data: any;
                try {
                    data = await res.json();
                } catch {
                    console.error('[NextAuth] Non-JSON response from backend, status:', res.status);
                    throw new Error('Unexpected server response');
                }

                console.log('[NextAuth] backend response status:', res.status, 'body:', data);

                if (!res.ok) {
                    // Surface the backend's error message so the user sees a real reason
                    throw new Error(data?.error || data?.message || 'Invalid credentials');
                }

                return {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    image: data.user.image || null,
                    backendToken: data.token,
                } as User;
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
