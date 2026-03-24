'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Sparkles, Map, DollarSign, Compass, RefreshCw } from 'lucide-react';
import axios, { CancelTokenSource } from 'axios';

// ── Constants ─────────────────────────────────────────────────────────────
const LOADING_MESSAGES = [
    'Thinking about your trip…',
    'Finding hidden gems…',
    'Building your itinerary…',
    'Almost there…',
];
const STYLES = ['Backpacker', 'Budget', 'Mid-range', 'Luxury'];
const PACES = ['Slow & relaxed', 'Balanced', 'Fast & packed'];
const LS_KEY = 'tripmind_plan_draft';
const MAX_CHARS = 500;

// ── Types ─────────────────────────────────────────────────────────────────
interface FormErrors {
    description?: string;
    days?: string;
    budget?: string;
    general?: string;
}

function PlanPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cancelSourceRef = useRef<CancelTokenSource | null>(null);

    // Pre-fill from URL params or saved localStorage draft
    const getInitial = <T,>(key: string, urlParam: string | null, fallback: T): T => {
        if (urlParam !== null) return urlParam as unknown as T;
        try {
            const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
            return (saved[key] as T) ?? fallback;
        } catch {
            return fallback;
        }
    };

    const [description, setDescription] = useState<string>(() =>
        getInitial('description', searchParams.get('destination') ? `I want to explore ${searchParams.get('destination')}` : null, '')
    );
    const [days, setDays] = useState<number | ''>(() =>
        getInitial('days', searchParams.get('days'), '' as number | '')
    );
    const [budget, setBudget] = useState<string>(() =>
        getInitial('budget', searchParams.get('budget'), '')
    );
    const [currency, setCurrency] = useState<string>(() =>
        getInitial('currency', searchParams.get('currency'), 'INR')
    );
    const [style, setStyle] = useState<string>(() =>
        getInitial('style', searchParams.get('style'), 'Mid-range')
    );
    const [pace, setPace] = useState<string>(() =>
        getInitial('pace', null, 'Balanced')
    );
    const [isLoading, setIsLoading] = useState(false);
    const [loadingIdx, setLoadingIdx] = useState(0);
    const [errors, setErrors] = useState<FormErrors>({});

    // ── Auth guard ───────────────────────────────────────────────────────
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) router.push('/auth/login');
    }, [router]);

    // ── Save draft to localStorage on field change ────────────────────────
    useEffect(() => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({ description, days, budget, currency, style, pace }));
        } catch { /* storage unavailable */ }
    }, [description, days, budget, currency, style, pace]);

    // ── Loading message carousel ─────────────────────────────────────────
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => setLoadingIdx((p) => (p + 1) % LOADING_MESSAGES.length), 2200);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    // ── Cancel request on navigate-away ──────────────────────────────────
    useEffect(() => {
        return () => { cancelSourceRef.current?.cancel('Page unmounted'); };
    }, []);

    // ── Validation ───────────────────────────────────────────────────────
    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!description.trim() || description.trim().length < 2) {
            e.description = 'Please describe your trip (at least 2 characters).';
        }
        if (description.trim().length > MAX_CHARS) {
            e.description = `Description must be under ${MAX_CHARS} characters.`;
        }
        const numDays = Number(days);
        if (!days || isNaN(numDays) || numDays < 1 || numDays > 30) {
            e.days = 'Days must be between 1 and 30.';
        }
        const numBudget = parseFloat(budget);
        if (!budget || isNaN(numBudget) || numBudget <= 0) {
            e.budget = 'Please enter a valid positive budget.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        setErrors({});

        const token = Cookies.get('token');
        const source = axios.CancelToken.source();
        cancelSourceRef.current = source;

        try {
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await axios.post(
                `${API}/trips/generate`,
                { description: description.trim(), days: Number(days), budget, currency, style, pace },
                { headers: { Authorization: `Bearer ${token}` }, cancelToken: source.token }
            );
            // Clear the draft on success
            try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
            router.push(`/dashboard?trip_id=${res.data.id}`);
        } catch (err: unknown) {
            if (axios.isCancel(err)) return;
            const axErr = err as { response?: { status?: number; data?: { error?: string } }; request?: unknown };
            if (axErr.response?.status === 401) {
                Cookies.remove('token');
                router.push('/auth/login');
                return;
            }
            const msg = axErr.response?.data?.error || (axErr.request ? 'Connection error. Please check your internet.' : 'Something went wrong. Please try again.');
            setErrors({ general: msg });
            setIsLoading(false);
        }
    };

    // ── Retry ─────────────────────────────────────────────────────────────
    const handleRetry = () => {
        setErrors({});
        setIsLoading(false);
    };

    /* — Loading screen — */
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
                style={{ background: 'var(--dark)' }}>
                <div className="pointer-events-none absolute inset-0"
                    style={{ background: 'radial-gradient(circle at center, rgba(224,123,79,0.15) 0%, transparent 70%)' }} />
                <motion.div
                    animate={{ x: [0, 40, -40, 0], y: [0, -20, 10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    className="mb-10 z-10"
                >
                    <Plane className="w-20 h-20" style={{ color: 'var(--accent)' }} />
                </motion.div>
                <div className="h-10 z-10">
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={loadingIdx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35 }}
                            className="font-fraunces font-light italic text-3xl text-center"
                            style={{ color: '#fff' }}
                        >
                            {LOADING_MESSAGES[loadingIdx]}
                        </motion.h2>
                    </AnimatePresence>
                </div>
                <button
                    onClick={() => { cancelSourceRef.current?.cancel('User cancelled'); setIsLoading(false); }}
                    className="z-10 mt-14 font-sora text-sm font-semibold"
                    style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    Cancel
                </button>
            </div>
        );
    }

    const inputBase: React.CSSProperties = {
        width: '100%',
        background: 'var(--bg)',
        border: '1.5px solid var(--border)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        color: 'var(--text)',
        fontFamily: 'var(--font-sora)',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
    };
    const inputErr: React.CSSProperties = { ...inputBase, borderColor: '#e05555' };

    const pillStyle = (active: boolean): React.CSSProperties => ({
        padding: '0.45rem 1.25rem',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: 'var(--font-sora)',
        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--muted)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minHeight: '44px',
        minWidth: '44px',
    });

    const charsLeft = MAX_CHARS - description.length;

    return (
        <div className="min-h-screen py-16 px-6 relative" style={{ background: 'var(--bg)' }}>

            {/* Back link */}
            <div className="max-w-[620px] mx-auto mb-6">
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'var(--muted)', textDecoration: 'none' }}>
                    ← Back to dashboard
                </Link>
            </div>

            <div className="max-w-[620px] mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="font-fraunces font-semibold mb-3" style={{ fontSize: 'clamp(2rem,5vw,3rem)', color: 'var(--text)' }}>
                        Design your journey
                    </h1>
                    <p className="font-sora text-sm" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                        Tell us what you love and AI will craft the perfect itinerary.
                    </p>
                </div>

                {/* General error banner with retry */}
                {errors.general && (
                    <div className="flex items-center justify-between gap-4 mb-6 px-5 py-4"
                        style={{ background: 'rgba(224,85,85,0.08)', border: '1.5px solid rgba(224,85,85,0.25)', borderRadius: '14px' }}>
                        <p className="font-sora text-sm" style={{ color: '#c0392b' }}>{errors.general}</p>
                        <button onClick={handleRetry}
                            className="flex items-center gap-1.5 font-sora text-sm font-semibold flex-shrink-0"
                            style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', minHeight: '44px' }}>
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                )}

                {/* Form card */}
                <motion.form
                    onSubmit={handleSubmit}
                    noValidate
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-7 p-8 sm:p-10"
                    style={{ background: 'var(--surface)', borderRadius: '20px', border: '1.5px solid var(--border)' }}
                >
                    {/* Describe */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2.5" style={{ color: 'var(--text)' }}>
                            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            Describe your trip
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_CHARS) setDescription(e.target.value);
                            }}
                            rows={4}
                            placeholder="5 days in Rajasthan — love street food and architecture, hate tourist crowds, budget ₹30k"
                            style={{ ...(errors.description ? inputErr : inputBase), resize: 'none', borderRadius: '14px', padding: '1rem' }}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                            {errors.description
                                ? <p className="text-xs" style={{ color: '#e05555' }}>{errors.description}</p>
                                : <span />
                            }
                            <p className="text-xs ml-auto" style={{ color: charsLeft <= 50 ? '#e05555' : 'var(--muted)' }}>
                                {charsLeft} / {MAX_CHARS}
                            </p>
                        </div>
                    </div>

                    {/* Days + Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2.5" style={{ color: 'var(--text)' }}>
                                <Map className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                How many days?
                            </label>
                            <input
                                type="number" min={1} max={30}
                                value={days} onChange={(e) => setDays(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g. 5"
                                style={errors.days ? inputErr : inputBase}
                            />
                            {errors.days && <p className="text-xs mt-1.5" style={{ color: '#e05555' }}>{errors.days}</p>}
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2.5" style={{ color: 'var(--text)' }}>
                                <DollarSign className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                Total Budget
                            </label>
                            <div style={{ display: 'flex', border: `1.5px solid ${errors.budget ? '#e05555' : 'var(--border)'}`, borderRadius: '12px', overflow: 'hidden', background: 'var(--bg)' }}>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    style={{ background: 'transparent', color: 'var(--text)', padding: '0.75rem 0.5rem 0.75rem 0.75rem', fontSize: '13px', fontWeight: 600, outline: 'none', borderRight: '1.5px solid var(--border)' }}
                                >
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                                <input
                                    type="number" value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    placeholder="30000"
                                    style={{ flex: 1, background: 'transparent', color: 'var(--text)', padding: '0.75rem', fontSize: '15px', outline: 'none' }}
                                />
                            </div>
                            {errors.budget && <p className="text-xs mt-1.5" style={{ color: '#e05555' }}>{errors.budget}</p>}
                        </div>
                    </div>

                    {/* Style pills */}
                    <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Travel Style</label>
                        <div className="flex flex-wrap gap-2">
                            {STYLES.map((s) => (
                                <button key={s} type="button" onClick={() => setStyle(s)} style={pillStyle(style === s)}>{s}</button>
                            ))}
                        </div>
                    </div>

                    {/* Pace pills */}
                    <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Trip Pace</label>
                        <div className="flex flex-wrap gap-2">
                            {PACES.map((p) => (
                                <button key={p} type="button" onClick={() => setPace(p)} style={pillStyle(pace === p)}>{p}</button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            background: isLoading ? 'var(--muted)' : 'var(--dark)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '100px',
                            padding: '0.9rem 2rem',
                            fontSize: '15px',
                            fontWeight: 600,
                            fontFamily: 'var(--font-sora)',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s, transform 0.2s',
                            minHeight: '44px',
                        }}
                        onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                        onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.background = 'var(--dark)'; e.currentTarget.style.transform = 'none'; } }}
                    >
                        Generate Itinerary →
                    </button>
                </motion.form>
            </div>
        </div>
    );
}

export default function PlanPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <Compass className="w-12 h-12 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
        }>
            <PlanPageInner />
        </Suspense>
    );
}
