'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!password || password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/auth/login', {
                email,
                password
            });

            if (response.data.token) {
                Cookies.set('token', response.data.token, { expires: 7 });
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setErrors({ ...errors, password: error.response?.data?.error || 'Failed to login' });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-white font-sans">
            {/* Left Panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-surface p-12 border-r border-white/5 relative overflow-hidden">
                {/* Abstract Background elements */}
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

                <Link href="/" className="text-3xl font-playfair font-bold text-gold z-10">
                    TripMind
                </Link>

                <div className="z-10 mt-12">
                    <h2 className="text-5xl font-playfair font-semibold leading-tight mb-6 tracking-wide">
                        Begin your next <br /> <span className="italic text-gold">great adventure.</span>
                    </h2>
                </div>

                <div className="z-10">
                    <p className="text-gray-400 font-playfair italic text-lg leading-relaxed max-w-md">
                        "The world is a book and those who do not travel read only one page."
                    </p>
                    <p className="text-gray-500 text-sm mt-3 font-semibold">— St. Augustine</p>
                </div>
            </div>

            {/* Right Panel (Form) */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
                <div className="w-full max-w-[360px] relative z-10">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-playfair font-bold mb-2">Welcome back</h1>
                        <p className="text-gray-400 text-sm">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-black/40 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all`}
                                placeholder="Enter your email"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full bg-black/40 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-white/10 bg-black/40 text-gold focus:ring-gold focus:ring-offset-background" />
                                <span className="text-xs text-gray-400">Remember for 30 days</span>
                            </label>
                            <Link href="#" className="text-xs text-gold hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gold text-black py-2.5 rounded-lg font-bold hover:bg-gold/90 transition-colors shadow-[0_0_15px_rgba(201,169,110,0.2)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <button
                            type="button"
                            className="w-full border border-white/10 text-white flex justify-center items-center gap-2 py-2.5 rounded-lg font-medium hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-8">
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="text-white font-medium hover:text-gold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
