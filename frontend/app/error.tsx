'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-8"
            style={{ background: 'var(--bg)', fontFamily: 'var(--font-sora)' }}
        >
            {/* Emoji icon */}
            <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-8 text-5xl"
                style={{ background: 'rgba(224,85,85,0.08)', border: '1.5px solid rgba(224,85,85,0.2)' }}
            >
                ⚠️
            </div>

            <h1
                className="font-fraunces font-semibold text-center mb-3"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text)' }}
            >
                Something went wrong
            </h1>
            <p className="font-sora text-sm text-center mb-8 max-w-md" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                We hit an unexpected snag. This may be a temporary issue — try refreshing or going back home.
            </p>

            <div className="flex gap-3 flex-wrap justify-center">
                <button
                    onClick={reset}
                    style={{
                        background: 'var(--dark)', color: '#fff', border: 'none',
                        borderRadius: '100px', padding: '0.75rem 1.75rem',
                        fontFamily: 'var(--font-sora)', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--dark)'; }}
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    style={{
                        background: 'var(--surface)', color: 'var(--text)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '100px', padding: '0.75rem 1.75rem',
                        fontFamily: 'var(--font-sora)', fontSize: '14px', fontWeight: 600,
                        textDecoration: 'none', transition: 'border-color 0.2s',
                    }}
                >
                    Go Home
                </Link>
            </div>

            <Link href="/" className="mt-12 text-2xl font-fraunces font-semibold" style={{ color: 'var(--text)', textDecoration: 'none' }}>
                Trip<span style={{ color: 'var(--accent)' }}>Mind</span>
            </Link>
        </div>
    );
}
