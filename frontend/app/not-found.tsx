'use client';

import Link from 'next/link';

export default function NotFoundPage() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-8"
            style={{ background: 'var(--bg)', fontFamily: 'var(--font-sora)' }}
        >
            <style>{`
        .not-found-btn:hover { background: var(--accent) !important; }
      `}</style>

            <h2
                className="font-fraunces font-semibold mb-4 select-none"
                style={{ fontSize: 'clamp(5rem, 15vw, 10rem)', color: 'var(--border)', lineHeight: 1 }}
            >
                404
            </h2>

            <h1
                className="font-fraunces font-semibold text-center mb-3"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text)' }}
            >
                This page doesn&apos;t exist
            </h1>
            <p className="font-sora text-sm text-center mb-8" style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: '380px' }}>
                Looks like you wandered off the map. Let&apos;s get you back to planning your next adventure.
            </p>

            <Link
                href="/"
                className="not-found-btn"
                style={{
                    background: 'var(--dark)', color: '#fff',
                    borderRadius: '100px', padding: '0.8rem 2rem',
                    fontFamily: 'var(--font-sora)', fontSize: '14px', fontWeight: 600,
                    textDecoration: 'none', display: 'inline-block',
                    transition: 'background 0.2s',
                }}
            >
                Go Home →
            </Link>

            <Link href="/" className="mt-12 text-2xl font-fraunces font-semibold" style={{ color: 'var(--text)', textDecoration: 'none' }}>
                Trip<span style={{ color: 'var(--accent)' }}>Mind</span>
            </Link>
        </div>
    );
}
