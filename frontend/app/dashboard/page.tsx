'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Calendar, MapPin, Sparkles,
    ChevronDown, Sun, Sunset, Moon, Map, LogOut,
    ArrowRight, Info, Share2, RefreshCw, DollarSign,
    Menu, X as CloseX,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import ChatPanel from '@/components/ChatPanel';
import PackingChecklist from '@/components/PackingChecklist';
import BudgetTracker from '@/components/BudgetTracker';
import { useToast } from '@/components/Toast';

const TripMap = dynamic(() => import('@/components/TripMap'), {
    ssr: false,
    loading: () => (
        <div style={{ width: '100%', height: '100%', background: 'var(--bg)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Map className="w-12 h-12 mb-3 animate-pulse" style={{ color: 'var(--accent)' }} />
            <p className="font-fraunces italic" style={{ color: 'var(--muted)' }}>Loading Map…</p>
        </div>
    )
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface SlotData { activity: string; place: string; tip: string; lat?: number; lng?: number; }
interface DayPlan { day: number; theme: string; estimated_cost: string; morning: SlotData; afternoon: SlotData; evening: SlotData; }
interface Itinerary { summary: string; total_estimated_cost: string; best_time_to_visit: string; packing_tips: string[]; hidden_gems: string[]; days: DayPlan[]; }
interface Trip { id: string; title: string; destination: string; days: number; budget: string; style: string; created_at: string; itinerary: Itinerary; }
interface WeatherDay { temp: number; rain: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STYLE_COLOUR: Record<string, string> = { Backpacker: 'var(--accent)', Budget: '#f59e0b', 'Mid-range': '#4f8fe0', Luxury: '#c9a96e', Adventure: '#3ca078', Cultural: '#818cf8' };
function getGreeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function weatherIcon(rain: number) { return rain >= 60 ? '🌧' : rain >= 30 ? '🌤' : '☀️'; }
function initials(name: string) { return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2); }

const slotIcon: Record<string, JSX.Element> = { morning: <Sun className="w-3.5 h-3.5" />, afternoon: <Sunset className="w-3.5 h-3.5" />, evening: <Moon className="w-3.5 h-3.5" /> };
const slotColor: Record<string, string> = { morning: 'var(--accent)', afternoon: '#f59e0b', evening: '#818cf8' };

// ─── Demo trip ────────────────────────────────────────────────────────────────
const DEMO_TRIP: Trip = {
    id: '__demo__', title: 'Jaipur in 3 Days — The Pink City', destination: 'Jaipur, Rajasthan',
    days: 3, budget: '₹ 18,000', style: 'Cultural', created_at: new Date().toISOString(),
    itinerary: {
        summary: "Three immersive days through Jaipur's forts, bazaars, and culinary gems.",
        total_estimated_cost: '₹ 18,000', best_time_to_visit: 'October–March',
        packing_tips: ['Sunscreen', 'Cotton kurta', 'Comfortable sandals', 'Small backpack', 'Cash'],
        hidden_gems: ['Panna Meena Ka Kund — a stunning stepwell most tourists miss', 'Anokhi Museum of Hand Printing', 'Rawat Misthan Bhandar — best pyaaz kachori since 1944'],
        days: [
            { day: 1, theme: 'Forts & Skylines', estimated_cost: '₹ 5,500', morning: { activity: 'Amber Fort exploration', place: 'Amber Fort, Amer', tip: 'Arrive by 9 am before the crowds.', lat: 26.9855, lng: 75.8513 }, afternoon: { activity: 'Nahargarh Fort sunset walk', place: 'Nahargarh Fort', tip: 'The rooftop café has the best panoramic view.', lat: 26.9390, lng: 75.8007 }, evening: { activity: 'Street food trail', place: 'Johri Bazaar', tip: 'Try dahi kachori — a Jaipur signature.', lat: 26.9124, lng: 75.7873 } },
            { day: 2, theme: 'Palaces & Bazaars', estimated_cost: '₹ 6,500', morning: { activity: 'City Palace museum tour', place: 'City Palace', tip: "The royal textile gallery is often skipped — don't miss it.", lat: 26.9258, lng: 75.8237 }, afternoon: { activity: 'Jantar Mantar walk', place: 'Jantar Mantar', tip: 'Hire a guide — each instrument has a story.', lat: 26.9241, lng: 75.8242 }, evening: { activity: 'Block printing workshop', place: 'Anokhi Museum', tip: 'Book online — fills up fast.', lat: 26.9389, lng: 75.8291 } },
            { day: 3, theme: 'Local Life & Hidden Gems', estimated_cost: '₹ 6,000', morning: { activity: 'Panna Meena Ka Kund stepwell', place: 'Amer Road', tip: 'Visit at 7–8 am for golden light and zero crowds.', lat: 26.9839, lng: 75.8508 }, afternoon: { activity: 'Samode Bazaar spice shopping', place: 'Samode Haveli area', tip: 'Ask for a custom Rajasthani masala blend.', lat: 26.9284, lng: 75.8284 }, evening: { activity: 'Chokhi Dhani cultural village', place: 'Chokhi Dhani, Tonk Road', tip: 'Folk dance starts at 7:30 pm.', lat: 26.8083, lng: 75.8458 } },
        ],
    },
};

// ─── Inspiration cards ────────────────────────────────────────────────────────
const INSPIRATIONS = [
    { destination: 'Rajasthan', emoji: '🏰', days: 5, budget: '25000', currency: 'INR', style: 'Backpacker', gradientFrom: '#E07B4F', gradientTo: '#C05A2A', description: 'Forts, camels & desert sunsets' },
    { destination: 'Bali', emoji: '🌴', days: 7, budget: '800', currency: 'USD', style: 'Mid-range', gradientFrom: '#3ca078', gradientTo: '#2a7a5a', description: 'Rice terraces & temple trails' },
    { destination: 'Manali', emoji: '🏔️', days: 4, budget: '18000', currency: 'INR', style: 'Adventure', gradientFrom: '#4f8fe0', gradientTo: '#2a5aaa', description: 'Peaks, snow & mountain cafés' },
    { destination: 'Tokyo', emoji: '🗾', days: 10, budget: '2000', currency: 'USD', style: 'Cultural', gradientFrom: '#818cf8', gradientTo: '#4f46e5', description: 'Neon, shrines & street food' },
];

// ─── Loading skeletons ────────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
            {/* Sidebar skeleton */}
            <aside className="w-[264px] flex-shrink-0 h-screen sticky top-0" style={{ background: 'var(--dark)' }}>
                <div className="p-7 pb-4"><div className="skeleton h-7 w-32 rounded-lg" /></div>
                <div className="px-5 pb-4"><div className="skeleton h-10 w-full rounded-full" /></div>
                <div className="px-5 space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}
                </div>
            </aside>
            {/* Main skeleton */}
            <main className="flex-1 p-10 space-y-6">
                <div className="skeleton h-10 w-64 rounded-xl" />
                <div className="skeleton h-5 w-48 rounded" />
                <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="skeleton h-48 rounded-2xl" />
                    <div className="skeleton h-48 rounded-2xl" />
                </div>
                <div className="skeleton h-72 rounded-2xl" />
                {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </main>
        </div>
    );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ background: 'var(--surface)', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '100%', border: '1.5px solid var(--border)' }}>
                <p className="font-sora text-sm mb-6" style={{ color: 'var(--text)', lineHeight: 1.7 }}>{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '100px', padding: '0.6rem 1.25rem', fontFamily: 'var(--font-sora)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--muted)' }}>Cancel</button>
                    <button onClick={onConfirm} style={{ background: 'var(--accent)', border: 'none', borderRadius: '100px', padding: '0.6rem 1.25rem', fontFamily: 'var(--font-sora)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Continue</button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const { data: session } = useSession();
    const initialTripId = searchParams.get('trip_id') || searchParams.get('trip');

    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [userName, setUserName] = useState('Traveller');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDay, setExpandedDay] = useState<number | null>(1);
    const [isDemoTrip, setIsDemoTrip] = useState(false);
    const [activeTab, setActiveTab] = useState<'itinerary' | 'budget'>('itinerary');
    const [weather, setWeather] = useState<Record<number, WeatherDay>>({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [confirmRegenerate, setConfirmRegenerate] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // ── Bridge: Google OAuth → Express cookie ──
    useEffect(() => {
        const bt = (session?.user as { backendToken?: string })?.backendToken;
        if (bt && !Cookies.get('token')) {
            Cookies.set('token', bt, { expires: 7 });
            window.location.reload();
        }
    }, [session]);

    // ── Session-expiry helper ──
    const expireSession = () => {
        Cookies.remove('token');
        showToast('Session expired, please sign in again', 'error');
        router.push('/auth/login');
    };

    // ── Fetch trips + user ──
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/auth/login'); return; }
        Promise.all([
            axios.get('http://localhost:8000/trips/my', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:8000/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(([tripsRes, meRes]) => {
            const fetched: Trip[] = tripsRes.data;
            setTrips(fetched);
            setUserName(meRes.data.name?.split(' ')[0] || 'Traveller');
            if (initialTripId) {
                const t = fetched.find((x) => x.id === initialTripId);
                if (t) { setSelectedTrip(t); setIsDemoTrip(false); return; }
            }
            if (fetched.length > 0) setSelectedTrip(fetched[0]);
        }).catch((err) => {
            if (err.response?.status === 401) { expireSession(); return; }
            if (!err.response) showToast('Connection error. Please check your internet.', 'error');
        }).finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, initialTripId]);

    // ── Fetch weather when trip changes ──
    useEffect(() => {
        if (!selectedTrip || isDemoTrip) {
            // For demo trip, inject hardcoded weather (Jaipur in March)
            if (isDemoTrip) setWeather({ 1: { temp: 34, rain: 5 }, 2: { temp: 33, rain: 8 }, 3: { temp: 35, rain: 3 } });
            return;
        }
        // Find first valid lat/lng in the trip
        const days = selectedTrip.itinerary?.days || [];
        let lat = 0, lng = 0;
        outer: for (const d of days) {
            for (const slot of ['morning', 'afternoon', 'evening'] as const) {
                if (d[slot]?.lat && d[slot]?.lng) { lat = d[slot].lat!; lng = d[slot].lng!; break outer; }
            }
        }
        if (!lat || !lng) return;
        const nDays = Math.min(selectedTrip.days, 16);
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,precipitation_probability_max&timezone=auto&forecast_days=${nDays}`)
            .then((r) => r.json())
            .then((data) => {
                const map: Record<number, WeatherDay> = {};
                data.daily?.temperature_2m_max?.forEach((temp: number, i: number) => {
                    map[i + 1] = { temp: Math.round(temp), rain: data.daily.precipitation_probability_max?.[i] || 0 };
                });
                setWeather(map);
            })
            .catch(() => { /* silently ignore weather fetch errors */ });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTrip?.id, isDemoTrip]);

    const handleSelectTrip = (trip: Trip) => {
        setSelectedTrip(trip); setIsDemoTrip(false); setExpandedDay(1); setActiveTab('itinerary');
        setMobileMenuOpen(false);
        const url = new URL(window.location.href);
        url.searchParams.set('trip_id', trip.id);
        window.history.replaceState({}, '', url.toString());
    };

    const handleLoadDemo = () => { setSelectedTrip(DEMO_TRIP); setIsDemoTrip(true); setExpandedDay(1); setActiveTab('itinerary'); };
    const handleInspirationClick = (card: typeof INSPIRATIONS[0]) => {
        const p = new URLSearchParams({ destination: card.destination, days: String(card.days), budget: card.budget, currency: card.currency, style: card.style });
        router.push(`/plan?${p.toString()}`);
    };

    const handleShare = async () => {
        if (!selectedTrip || isDemoTrip) return;
        const url = `${window.location.origin}/trip/share/${selectedTrip.id}`;
        try { await navigator.clipboard.writeText(url); showToast('Share link copied!', 'success'); }
        catch { showToast('Could not copy link', 'error'); }
    };

    const handleRegenerate = async () => {
        if (!selectedTrip || isDemoTrip) return;
        setConfirmRegenerate(false);
        setIsRegenerating(true);
        const token = Cookies.get('token');
        try {
            const res = await axios.post('http://localhost:8000/trips/generate', {
                description: `Regenerate my trip to ${selectedTrip.destination}. Keep it ${selectedTrip.style?.toLowerCase()}, same general vibe.`,
                days: selectedTrip.days, budget: selectedTrip.budget,
                currency: 'INR', style: selectedTrip.style, pace: 'Balanced',
                destination: selectedTrip.destination,
            }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('New itinerary generated!', 'success');
            router.push(`/dashboard?trip_id=${res.data.id}`);
            router.refresh();
        } catch (err: unknown) {
            if ((err as { response?: { status?: number } }).response?.status === 401) { expireSession(); return; }
            const axErr = err as { response?: { data?: { error?: string } }; request?: unknown };
            const msg = axErr.response?.data?.error || (!axErr.response ? 'Connection error. Please check your internet.' : 'AI is taking too long. Please try again.');
            showToast(msg, 'error');
        } finally {
            setIsRegenerating(false);
        }
    };

    if (isLoading) return <DashboardSkeleton />;

    const hasTrips = trips.length > 0;

    // ── Sidebar JSX (shared) ──
    const SidebarContent = () => (
        <>
            <div className="p-7 pb-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-fraunces font-semibold tracking-wide" style={{ color: '#fff', textDecoration: 'none' }}>
                    Trip<span style={{ color: 'var(--accent)' }}>Mind</span>
                </Link>
                <button className="lg:hidden" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <CloseX className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* User avatar */}
            <div className="px-6 pb-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent)', fontSize: '11px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-sora)' }}>
                    {initials(userName)}
                </div>
                <div>
                    <p className="font-sora text-xs font-semibold text-white leading-tight">{userName}</p>
                    <p className="font-sora text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{getGreeting()}</p>
                </div>
            </div>

            <div className="px-5 pb-4">
                <Link href="/plan" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full font-sora font-semibold text-sm"
                    style={{ background: 'var(--accent)', color: '#fff', borderRadius: '100px', padding: '0.6rem 1rem', textDecoration: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dark)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                >
                    <Plus className="w-4 h-4" /> New Trip
                </Link>
            </div>

            {hasTrips && (
                <div className="px-6 pb-2">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
                    </p>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 space-y-2">
                {hasTrips ? (
                    <>
                        <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Past Trips</p>
                        {trips.map((trip) => {
                            const active = selectedTrip?.id === trip.id && !isDemoTrip;
                            const dot = STYLE_COLOUR[trip.style] || 'var(--accent)';
                            return (
                                <button key={trip.id} onClick={() => handleSelectTrip(trip)} className="w-full text-left p-4 transition-all"
                                    style={{ borderRadius: '14px', background: active ? 'rgba(224,123,79,0.15)' : 'rgba(255,255,255,0.04)', border: active ? '1.5px solid rgba(224,123,79,0.4)' : '1.5px solid transparent' }}
                                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                                        <h4 className="font-semibold text-sm truncate leading-tight" style={{ color: active ? 'var(--accent)' : '#fff' }}>{trip.destination}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs pl-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trip.days}d</span>
                                        <span>{new Date(trip.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </>
                ) : (
                    <p className="text-sm px-2 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>No trips yet — start planning!</p>
                )}
            </div>

            <div className="p-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <button onClick={() => { Cookies.remove('token'); router.push('/auth/login'); }}
                    className="flex items-center gap-2 text-sm font-semibold transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >
                    <LogOut className="w-4 h-4" /> Log out
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--bg)', fontFamily: 'var(--font-sora)' }}>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside className="sidebar-desktop w-[264px] flex-shrink-0 flex-col h-screen sticky top-0"
                style={{ background: 'var(--dark)', display: 'flex' }}>
                <SidebarContent />
            </aside>

            {/* ── MOBILE SIDEBAR SHEET ── */}
            <div className={`mobile-sheet-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.aside
                        initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="flex flex-col h-screen"
                        style={{ position: 'fixed', left: 0, top: 0, width: '264px', background: 'var(--dark)', zIndex: 160, overflowY: 'auto' }}
                    >
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── MOBILE NAVBAR ── */}
            <div className="mobile-nav-bar" style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--dark)', zIndex: 140, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/" className="font-fraunces font-semibold text-lg" style={{ color: '#fff', textDecoration: 'none' }}>
                    Trip<span style={{ color: 'var(--accent)' }}>Mind</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* ── MAIN AREA ── */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar" style={{ background: 'var(--bg)', paddingTop: 0 }}>
                <AnimatePresence mode="wait">

                    {/* ── ONBOARDING ── */}
                    {!hasTrips && !selectedTrip && (
                        <motion.div key="onboarding" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                            className="min-h-full flex flex-col px-6 lg:px-10 py-14">
                            <div className="mb-10">
                                <h1 className="font-fraunces font-semibold mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text)' }}>
                                    Welcome, {userName} 👋
                                </h1>
                                <p className="font-sora text-lg" style={{ color: 'var(--muted)' }}>Your travel story starts here.</p>
                            </div>
                            <div className="mb-10">
                                <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--muted)' }}>Need inspiration? Pick a destination →</p>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {INSPIRATIONS.map((card) => (
                                        <motion.button key={card.destination} onClick={() => handleInspirationClick(card)} whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}
                                            className="text-left p-5 relative overflow-hidden"
                                            style={{ background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})`, borderRadius: '20px', border: 'none', cursor: 'pointer', minHeight: '140px' }}>
                                            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }} />
                                            <span className="text-3xl mb-3 block">{card.emoji}</span>
                                            <h3 className="font-fraunces font-semibold text-white text-lg leading-snug mb-1">{card.destination}</h3>
                                            <p className="font-sora text-xs text-white/70 mb-2">{card.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-white/60 font-semibold">
                                                <span>{card.days} days</span><span>·</span>
                                                <span>{card.currency === 'INR' ? '₹' : '$'}{card.budget}</span>
                                            </div>
                                            <div className="absolute bottom-4 right-4"><ArrowRight className="w-4 h-4 text-white/60" /></div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <Link href="/plan" className="font-sora font-semibold flex items-center gap-2"
                                    style={{ background: 'var(--accent)', color: '#fff', borderRadius: '100px', padding: '0.85rem 2rem', fontSize: '15px', textDecoration: 'none', transition: 'background 0.2s, transform 0.2s' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none'; }}
                                >
                                    Plan My First Trip <ArrowRight className="w-4 h-4" />
                                </Link>
                                <button onClick={handleLoadDemo} className="font-sora text-sm font-semibold flex items-center gap-1.5"
                                    style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.85rem 0', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}>
                                    <Sparkles className="w-4 h-4" /> Or explore a sample itinerary
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── TRIP VIEW ── */}
                    {selectedTrip && (
                        <motion.div key={selectedTrip.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                            className="max-w-4xl mx-auto px-4 lg:px-8 py-10 lg:py-12">

                            {/* Demo banner */}
                            {isDemoTrip && (
                                <div className="flex items-center gap-3 px-5 py-3 mb-8"
                                    style={{ background: 'rgba(224,123,79,0.08)', border: '1.5px solid rgba(224,123,79,0.25)', borderRadius: '12px' }}>
                                    <Info className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                    <p className="font-sora text-sm" style={{ color: 'var(--text)' }}>
                                        This is a <strong>sample trip</strong> — no API call was made.{' '}
                                        <Link href="/plan" style={{ color: 'var(--accent)', fontWeight: 600 }}>Generate your own →</Link>
                                    </p>
                                </div>
                            )}

                            {/* Personalized greeting (normal, not demo) */}
                            {hasTrips && !isDemoTrip && (
                                <div className="mb-8 flex items-end justify-between">
                                    <div>
                                        <p className="font-fraunces font-light italic text-xl mb-1" style={{ color: 'var(--muted)' }}>{getGreeting()}, {userName}</p>
                                        <p className="font-sora text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                                            You have planned <span style={{ color: 'var(--text)' }}>{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── HEADER ── */}
                            <header className="mb-8">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-5">
                                    <div>
                                        <h1 className="font-fraunces font-semibold leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.75rem)', color: 'var(--text)' }}>
                                            {selectedTrip.title}
                                        </h1>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="flex items-center gap-2 text-sm font-semibold px-4 py-2" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)' }}>
                                                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> {selectedTrip.destination}
                                            </span>
                                            <span className="flex items-center gap-2 text-sm font-semibold px-4 py-2" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)' }}>
                                                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> {selectedTrip.days} Days
                                            </span>
                                            {/* Share + Regenerate */}
                                            {!isDemoTrip && (
                                                <>
                                                    <button onClick={handleShare}
                                                        className="flex items-center gap-2 text-sm font-semibold px-4 py-2"
                                                        style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                                    >
                                                        <Share2 className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Share
                                                    </button>
                                                    <button onClick={() => setConfirmRegenerate(true)} disabled={isRegenerating}
                                                        className="flex items-center gap-2 text-sm font-semibold px-4 py-2"
                                                        style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)', cursor: isRegenerating ? 'progress' : 'pointer', transition: 'border-color 0.2s' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                                    >
                                                        <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} style={{ color: 'var(--accent)' }} />
                                                        {isRegenerating ? 'Regenerating…' : 'Regenerate'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* Cost badge */}
                                    <div className="shrink-0 text-center px-7 py-4" style={{ background: 'rgba(60,160,120,0.08)', border: '1.5px solid rgba(60,160,120,0.25)', borderRadius: '20px' }}>
                                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#3ca078' }}>Est. Cost</p>
                                        <p className="text-2xl font-fraunces font-semibold" style={{ color: 'var(--text)' }}>{selectedTrip.itinerary.total_estimated_cost}</p>
                                    </div>
                                </div>
                                {selectedTrip.itinerary.summary && (
                                    <p className="font-fraunces italic text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
                                        &ldquo;{selectedTrip.itinerary.summary}&rdquo;
                                    </p>
                                )}
                            </header>

                            {/* ── TABS ── */}
                            <div className="flex gap-1 p-1 mb-8 no-print" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px', display: 'inline-flex' }}>
                                {(['itinerary', 'budget'] as const).map((tab) => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className="font-sora text-sm font-semibold px-5 py-2 capitalize"
                                        style={{
                                            borderRadius: '100px', border: 'none', cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
                                            background: activeTab === tab ? 'var(--dark)' : 'transparent',
                                            color: activeTab === tab ? '#fff' : 'var(--muted)',
                                        }}>
                                        {tab === 'budget' ? <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Budget</span> : 'Itinerary'}
                                    </button>
                                ))}
                            </div>

                            {/* ── ITINERARY TAB ── */}
                            {activeTab === 'itinerary' && (
                                <div>
                                    {/* Hidden Gems + Packing Checklist */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                                        <div className="p-7" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '20px' }}>
                                            <h3 className="font-fraunces font-semibold text-xl mb-5 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(224,123,79,0.12)', color: 'var(--accent)' }}><Sparkles className="w-4 h-4" /></span>
                                                Hidden Gems
                                            </h3>
                                            {selectedTrip.itinerary.hidden_gems?.length ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {selectedTrip.itinerary.hidden_gems.map((gem, i) => (
                                                        <div key={i} className="p-3 text-sm leading-snug"
                                                            style={{ background: 'rgba(224,123,79,0.06)', border: '1px solid rgba(224,123,79,0.15)', borderRadius: '12px', color: 'var(--text)' }}>{gem}</div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-sm italic" style={{ color: 'var(--muted)' }}>No hidden gems provided.</p>}
                                        </div>

                                        <div className="p-7" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '20px' }}>
                                            {selectedTrip.itinerary.packing_tips?.length ? (
                                                <PackingChecklist tips={selectedTrip.itinerary.packing_tips} tripId={selectedTrip.id} />
                                            ) : <p className="font-sora text-sm italic" style={{ color: 'var(--muted)' }}>No packing tips provided.</p>}
                                        </div>
                                    </div>

                                    {/* Map */}
                                    <div className="mb-10" style={{ width: '100%', height: '360px', borderRadius: '20px', overflow: 'hidden', border: '1.5px solid var(--border)' }}>
                                        <TripMap places={
                                            selectedTrip.itinerary.days?.flatMap((d) => {
                                                const pts: { name: string; lat: number; lng: number; day: number }[] = [];
                                                if (d.morning?.lat && d.morning.lng) pts.push({ name: d.morning.place, lat: d.morning.lat, lng: d.morning.lng, day: d.day });
                                                if (d.afternoon?.lat && d.afternoon.lng) pts.push({ name: d.afternoon.place, lat: d.afternoon.lat, lng: d.afternoon.lng, day: d.day });
                                                if (d.evening?.lat && d.evening.lng) pts.push({ name: d.evening.place, lat: d.evening.lat, lng: d.evening.lng, day: d.day });
                                                return pts;
                                            }) || []} />
                                    </div>

                                    {/* Day accordion */}
                                    <h2 className="font-fraunces font-semibold text-3xl mb-6 flex items-center gap-4" style={{ color: 'var(--text)' }}>
                                        <span className="h-px w-8" style={{ background: 'var(--accent)' }} /> Daily Itinerary
                                    </h2>
                                    <div className="space-y-4">
                                        {selectedTrip.itinerary.days?.map((dayPlan) => {
                                            const w = weather[dayPlan.day];
                                            return (
                                                <div key={dayPlan.day}
                                                    style={{ background: expandedDay === dayPlan.day ? 'var(--surface)' : '#fafaf8', border: '1.5px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
                                                    <button onClick={() => setExpandedDay(expandedDay === dayPlan.day ? null : dayPlan.day)}
                                                        className="w-full px-7 py-5 flex items-center justify-between outline-none">
                                                        <div className="flex items-center gap-5 text-left">
                                                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl"
                                                                style={{ background: 'rgba(224,123,79,0.1)', border: '1.5px solid rgba(224,123,79,0.2)' }}>
                                                                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>DAY</span>
                                                                <span className="text-2xl font-fraunces font-semibold leading-none" style={{ color: 'var(--text)' }}>{dayPlan.day}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-sora font-semibold text-base mb-1" style={{ color: 'var(--text)' }}>{dayPlan.theme}</h4>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                                                                        Est. <span style={{ color: 'rgba(60,160,120,0.9)' }}>{dayPlan.estimated_cost}</span>
                                                                    </span>
                                                                    {/* Weather badge */}
                                                                    {w && (
                                                                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5"
                                                                            style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)' }}>
                                                                            {weatherIcon(w.rain)} {w.temp}°C · {w.rain}% rain
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                                            style={{ background: expandedDay === dayPlan.day ? 'rgba(224,123,79,0.12)' : 'var(--bg)', border: '1.5px solid var(--border)' }}>
                                                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedDay === dayPlan.day ? 'rotate-180' : ''}`}
                                                                style={{ color: expandedDay === dayPlan.day ? 'var(--accent)' : 'var(--muted)' }} />
                                                        </div>
                                                    </button>
                                                    <AnimatePresence initial={false}>
                                                        {expandedDay === dayPlan.day && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                                                                <div className="px-7 pb-7 pt-1 space-y-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                                                    {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
                                                                        const s = dayPlan[slot];
                                                                        if (!s) return null;
                                                                        return (
                                                                            <div key={slot} className="relative pl-7 border-l-2" style={{ borderColor: `${slotColor[slot]}30` }}>
                                                                                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center"
                                                                                    style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: slotColor[slot] }}>
                                                                                    {slotIcon[slot]}
                                                                                </div>
                                                                                <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: slotColor[slot] }}>{slot.charAt(0).toUpperCase() + slot.slice(1)}</p>
                                                                                <p className="font-sora font-semibold text-base mb-1" style={{ color: 'var(--text)' }}>{s.activity}</p>
                                                                                <p className="font-sora text-sm flex items-center gap-1.5 mb-3" style={{ color: 'var(--muted)' }}>
                                                                                    <MapPin className="w-3 h-3 flex-shrink-0" /> {s.place}
                                                                                </p>
                                                                                <div className="p-4 text-sm italic leading-relaxed"
                                                                                    style={{ background: `${slotColor[slot]}08`, border: `1px solid ${slotColor[slot]}20`, borderRadius: '12px', color: 'var(--text)' }}>
                                                                                    <span className="font-semibold not-italic" style={{ color: slotColor[slot] }}>Tip: </span>{s.tip}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── BUDGET TAB ── */}
                            {activeTab === 'budget' && (
                                <BudgetTracker
                                    tripId={selectedTrip.id}
                                    estimatedBudget={selectedTrip.itinerary.total_estimated_cost}
                                    days={selectedTrip.itinerary.days?.map((d) => ({ day: d.day, estimated_cost: d.estimated_cost })) || []}
                                />
                            )}

                            <div className="h-20" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* ── CHAT PANEL (floating) ── */}
            <ChatPanel trip={selectedTrip} />

            {/* ── REGENERATE CONFIRM ── */}
            <AnimatePresence>
                {confirmRegenerate && (
                    <ConfirmModal
                        message="This will generate a brand-new itinerary for the same destination and save it as a new trip. Your current trip won't be deleted. Continue?"
                        onConfirm={handleRegenerate}
                        onCancel={() => setConfirmRegenerate(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}
