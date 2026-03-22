'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useToast } from '@/components/Toast';

const MAX_ATTEMPTS_BEFORE_HINT = 5;

export default function LoginPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);

    const validate = () => {
        const e: typeof errors = {};
        if (!email.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
            e.email = 'Please enter a valid email address';
        }
        if (!password.trim()) e.password = 'Please enter your password';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleGoogle = async () => {
        setIsGoogleLoading(true);
        await signIn('google', { callbackUrl: '/dashboard' });
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        setErrors({});

        const result = await signIn('credentials', {
            email: email.trim(),
            password: password.trim(),
            redirect: false,
        });

        if (result?.error) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);
            if (newAttempts >= MAX_ATTEMPTS_BEFORE_HINT) {
                setErrors({ general: 'Too many attempts. Please wait a moment before trying again.' });
            } else {
                setErrors({ general: 'Incorrect email or password' });
            }
            setIsLoading(false);
        } else {
            showToast('Welcome back!', 'success');
            router.push('/dashboard');
        }
    };

    const inputStyle = (hasError?: string): React.CSSProperties => ({
        width: '100%', background: 'var(--bg)',
        border: `1.5px solid ${hasError ? '#e05555' : 'var(--border)'}`,
        borderRadius: '12px', padding: '0.75rem 1rem',
        color: 'var(--text)', fontFamily: 'var(--font-sora)',
        fontSize: '15px', outline: 'none',
    });

    return (
        <div className="flex min-h-screen" style={{ fontFamily: 'var(--font-sora)' }}>

            {/* ── LEFT PANEL (dark) ── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden" style={{ background: 'var(--dark)' }}>
                <div className="pointer-events-none absolute top-1/4 -left-32 w-80 h-80 rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, #E07B4F 0%, transparent 70%)', filter: 'blur(80px)' }} />
                <div className="pointer-events-none absolute bottom-1/4 -right-24 w-72 h-72 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #4f8fe0 0%, transparent 70%)', filter: 'blur(80px)' }} />
                <Link href="/" className="text-2xl font-fraunces font-semibold tracking-wide z-10" style={{ color: '#fff', textDecoration: 'none' }}>
                    Trip<span style={{ color: 'var(--accent)' }}>Mind</span>
                </Link>
                <div className="z-10">
                    <h2 className="font-fraunces font-light italic text-white leading-tight mb-8" style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}>
                        Begin your next<br /><em style={{ color: 'var(--accent)' }}>great adventure.</em>
                    </h2>
                    <blockquote>
                        <p className="font-fraunces italic leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '17px' }}>
                            &ldquo;The world is a book and those who do not travel read only one page.&rdquo;
                        </p>
                        <cite className="font-sora text-sm font-semibold not-italic" style={{ color: 'rgba(255,255,255,0.35)' }}>— St. Augustine</cite>
                    </blockquote>
                </div>
            </div>

            {/* ── RIGHT PANEL (cream) ── */}
            <div className="flex-1 flex flex-col justify-center items-center p-8" style={{ background: 'var(--bg)' }}>
                <div className="w-full max-w-[380px]">

                    <Link href="/" className="lg:hidden block text-2xl font-fraunces font-semibold mb-10 text-center" style={{ color: 'var(--text)', textDecoration: 'none' }}>
                        Trip<span style={{ color: 'var(--accent)' }}>Mind</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="font-fraunces font-semibold mb-2" style={{ fontSize: '2rem', color: 'var(--text)' }}>Welcome back</h1>
                        <p className="font-sora text-sm" style={{ color: 'var(--muted)' }}>Sign in to your account to continue.</p>
                    </div>

                    {/* Google button */}
                    <button
                        onClick={handleGoogle}
                        disabled={isGoogleLoading || isLoading}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px',
                            padding: '0.75rem 1.5rem', fontFamily: 'var(--font-sora)', fontSize: '14px', fontWeight: 600,
                            color: 'var(--text)', cursor: (isGoogleLoading || isLoading) ? 'not-allowed' : 'pointer', marginBottom: '1rem',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => { if (!isGoogleLoading && !isLoading) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(224,123,79,0.1)'; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        {/* Google G icon */}
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                        </svg>
                        {isGoogleLoading ? 'Redirecting…' : 'Continue with Google'}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        <span className="font-sora text-xs" style={{ color: 'var(--muted)' }}>or</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>

                    {/* Form card */}
                    <div className="p-8" style={{ background: 'var(--surface)', borderRadius: '20px', border: '1.5px solid var(--border)' }}>
                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text)' }}>Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle(errors.email)} disabled={isLoading} />
                                {errors.email && <p className="text-xs mt-1.5" style={{ color: '#e05555' }}>{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text)' }}>Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle(errors.password)} disabled={isLoading} />
                                {errors.password && <p className="text-xs mt-1.5" style={{ color: '#e05555' }}>{errors.password}</p>}
                            </div>

                            {/* General error (wrong credentials / rate limit) */}
                            {errors.general && (
                                <p className="text-xs py-2.5 px-3.5 rounded-lg" style={{ color: '#e05555', background: 'rgba(224,85,85,0.07)', border: '1px solid rgba(224,85,85,0.2)' }}>
                                    {errors.general}
                                </p>
                            )}

                            <div className="flex justify-end">
                                <Link href="#" className="text-xs font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Forgot password?</Link>
                            </div>
                            <button type="submit" disabled={isLoading}
                                style={{ width: '100%', background: isLoading ? 'var(--muted)' : 'var(--dark)', color: '#fff', border: 'none', borderRadius: '100px', padding: '0.8rem 2rem', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-sora)', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'var(--accent)'; }}
                                onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = 'var(--dark)'; }}
                            >
                                {isLoading ? 'Signing in…' : 'Sign In →'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--muted)' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: 'var(--text)' }}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
