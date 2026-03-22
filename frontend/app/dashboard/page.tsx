'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass, Plus, Calendar, MapPin, Sparkles,
    ChevronDown, Sun, Sunset, Moon, Map
} from 'lucide-react';
import dynamic from 'next/dynamic';

const TripMap = dynamic(() => import('@/components/TripMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-black/40 flex flex-col items-center justify-center text-gray-500 relative overflow-hidden group border border-white/5 rounded-[2rem] shadow-2xl">
            <div className="absolute inset-0 bg-surface opacity-60 mix-blend-overlay"></div>
            <Map className="w-16 h-16 mb-4 opacity-40 animate-pulse text-gold" />
            <p className="font-playfair text-xl italic opacity-70">Loading Map...</p>
        </div>
    )
});

interface Trip {
    id: string;
    title: string;
    destination: string;
    days: number;
    budget: string;
    created_at: string;
    itinerary: {
        summary: string;
        total_estimated_cost: string;
        best_time_to_visit: string;
        packing_tips: string[];
        hidden_gems: string[];
        days: {
            day: number;
            theme: string;
            estimated_cost: string;
            morning: { activity: string; place: string; tip: string; lat?: number; lng?: number };
            afternoon: { activity: string; place: string; tip: string; lat?: number; lng?: number };
            evening: { activity: string; place: string; tip: string; lat?: number; lng?: number };
        }[];
    };
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTripId = searchParams.get('trip_id') || searchParams.get('trip');

    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDay, setExpandedDay] = useState<number | null>(1);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchTrips = async () => {
            try {
                const response = await axios.get('http://localhost:8000/trips/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const fetchedTrips: Trip[] = response.data;
                setTrips(fetchedTrips);

                if (initialTripId) {
                    const trip = fetchedTrips.find((t) => t.id === initialTripId);
                    if (trip) setSelectedTrip(trip);
                }
            } catch (error: any) {
                console.error("Failed to fetch trips", error);
                if (error.response?.status === 401) {
                    Cookies.remove('token');
                    router.push('/auth/login');
                    return;
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrips();
    }, [router, initialTripId]);

    const handleSelectTrip = (trip: Trip) => {
        setSelectedTrip(trip);
        setExpandedDay(1);

        const url = new URL(window.location.href);
        url.searchParams.set('trip_id', trip.id);
        window.history.replaceState({}, '', url.toString());
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-white flex items-center justify-center font-sans">
                <div className="animate-pulse flex flex-col items-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                        <Compass className="w-16 h-16 text-gold mb-6 shadow-gold/20 drop-shadow-lg" />
                    </motion.div>
                    <p className="text-gray-400 font-playfair tracking-wide text-lg">Loading your journeys...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white flex font-sans overflow-hidden">
            {/* LEFT SIDEBAR */}
            <aside className="w-[280px] bg-surface border-r border-white/5 flex flex-col h-screen flex-shrink-0 relative z-20">
                <div className="p-8 border-b border-white/5">
                    <Link href="/" className="text-3xl font-playfair font-bold text-gold tracking-wide">
                        TripMind
                    </Link>
                </div>

                <div className="p-6">
                    <Link
                        href="/plan"
                        className="w-full bg-gold/10 text-gold border border-gold/30 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gold hover:text-black hover:scale-105 transition-all font-bold shadow-[0_0_15px_rgba(201,169,110,0.1)]"
                    >
                        <Plus className="w-5 h-5" /> New Trip
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-2 pb-8 space-y-4 custom-scrollbar">
                    <h3 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-4 px-1">Past Trips</h3>

                    {trips.length === 0 ? (
                        <div className="px-1 text-sm text-gray-500 italic font-medium">No trips generated yet.</div>
                    ) : (
                        trips.map((trip) => (
                            <button
                                key={trip.id}
                                onClick={() => handleSelectTrip(trip)}
                                className={`w-full text-left p-5 rounded-2xl transition-all border ${selectedTrip?.id === trip.id
                                    ? 'bg-gold/10 border-gold/30 shadow-[0_0_15px_rgba(201,169,110,0.15)] scale-[1.02]'
                                    : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                                    }`}
                            >
                                <h4 className={`font-semibold truncate mb-1.5 ${selectedTrip?.id === trip.id ? 'text-gold' : 'text-white'}`}>
                                    {trip.destination}
                                </h4>
                                <div className="flex items-center text-xs text-gray-400 gap-3 font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trip.days} Days</span>
                                    <span>{new Date(trip.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-white/5 text-sm flex justify-center">
                    <button
                        onClick={() => { Cookies.remove('token'); router.push('/auth/login'); }}
                        className="text-gray-500 hover:text-white transition-colors font-medium flex gap-2 items-center"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            {/* RIGHT ITINERARY VIEW */}
            <main className="flex-1 h-screen overflow-y-auto relative z-10 custom-scrollbar">
                {/* Background blobs for main area */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                {!selectedTrip ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-32 h-32 bg-surface border border-white/10 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                            <Compass className="w-14 h-14 text-gold opacity-80" />
                        </div>
                        <h2 className="text-4xl font-playfair font-bold mb-4">Your next adventure awaits</h2>
                        <Link
                            href="/plan"
                            className="text-gold text-lg hover:text-gold/80 font-bold group flex items-center gap-2"
                        >
                            Plan your first trip <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto p-10 lg:p-14">
                        {/* Header */}
                        <header className="mb-14">
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                                <div>
                                    <h1 className="text-5xl font-playfair font-semibold text-white mb-4 leading-tight tracking-wide">
                                        {selectedTrip.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-300 font-medium">
                                        <span className="flex items-center gap-2 bg-surface border border-white/5 px-4 py-2 rounded-full shadow-inner"><MapPin className="w-4 h-4 text-gold" /> {selectedTrip.destination}</span>
                                        <span className="flex items-center gap-2 bg-surface border border-white/5 px-4 py-2 rounded-full shadow-inner"><Calendar className="w-4 h-4 text-gold" /> {selectedTrip.days} Days</span>
                                    </div>
                                </div>
                                <div className="bg-surface border border-gold/30 px-8 py-5 rounded-3xl text-center shadow-[0_0_20px_rgba(201,169,110,0.1)]">
                                    <div className="text-xs uppercase tracking-widest font-bold text-gold opacity-80 mb-2">Est. Cost</div>
                                    <div className="text-3xl font-bold">{selectedTrip.itinerary.total_estimated_cost}</div>
                                </div>
                            </div>
                            <p className="text-xl text-gray-400 leading-relaxed max-w-4xl font-playfair italic">
                                "{selectedTrip.itinerary.summary}"
                            </p>
                        </header>

                        {/* Hidden Gems & Packing Tips */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
                            <div className="bg-surface border border-white/5 p-8 rounded-3xl shadow-xl">
                                <h3 className="text-xl font-playfair font-bold mb-6 flex items-center gap-3 text-gold">
                                    <Sparkles className="w-5 h-5" /> Hidden Gems
                                </h3>
                                <ul className="space-y-4">
                                    {selectedTrip.itinerary.hidden_gems?.map((gem, i) => (
                                        <li key={i} className="text-base text-gray-300 flex items-start gap-3">
                                            <span className="text-gold mt-1">•</span> <span className="leading-snug">{gem}</span>
                                        </li>
                                    ))}
                                    {(!selectedTrip.itinerary.hidden_gems || selectedTrip.itinerary.hidden_gems.length === 0) && (
                                        <li className="text-sm text-gray-500 italic font-medium">No hidden gems provided.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-surface border border-white/5 p-8 rounded-3xl flex flex-col shadow-xl">
                                <h3 className="text-xl font-playfair font-bold mb-6 text-white border-b border-white/5 pb-4">Packing Tips</h3>
                                <div className="flex flex-wrap gap-3">
                                    {selectedTrip.itinerary.packing_tips?.map((tip, i) => (
                                        <span key={i} className="bg-black/40 border border-white/10 text-gray-300 px-5 py-2.5 rounded-full text-sm font-semibold hover:border-gold/30 transition-colors shadow-inner">
                                            {tip}
                                        </span>
                                    ))}
                                    {(!selectedTrip.itinerary.packing_tips || selectedTrip.itinerary.packing_tips.length === 0) && (
                                        <span className="text-sm text-gray-500 italic font-medium">No packing tips provided.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Component Map */}
                        <div className="w-full h-[400px] border border-white/5 rounded-[2rem] mb-16 relative overflow-hidden shadow-2xl z-0">
                            <TripMap places={
                                selectedTrip?.itinerary.days?.flatMap(d => {
                                    const pts = [];
                                    if (d.morning?.lat && d.morning?.lng) pts.push({ name: d.morning.place, lat: d.morning.lat, lng: d.morning.lng, day: d.day });
                                    if (d.afternoon?.lat && d.afternoon?.lng) pts.push({ name: d.afternoon.place, lat: d.afternoon.lat, lng: d.afternoon.lng, day: d.day });
                                    if (d.evening?.lat && d.evening?.lng) pts.push({ name: d.evening.place, lat: d.evening.lat, lng: d.evening.lng, day: d.day });
                                    return pts;
                                }) || []
                            } />
                        </div>

                        {/* Day-by-day Itinerary Accordion */}
                        <div>
                            <h2 className="text-3xl font-playfair font-bold mb-8 flex items-center gap-4">
                                <span className="w-10 h-px bg-gold border border-gold shadow-[0_0_10px_rgba(201,169,110,1)]"></span>
                                Daily Itinerary
                            </h2>

                            <div className="space-y-5">
                                {selectedTrip.itinerary.days?.map((dayPlan) => (
                                    <div key={dayPlan.day} className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-white/10 transition-colors">
                                        <button
                                            onClick={() => setExpandedDay(expandedDay === dayPlan.day ? null : dayPlan.day)}
                                            className="w-full px-8 py-6 flex items-center justify-between transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                        >
                                            <div className="flex items-center gap-6 text-left">
                                                <div className="flex flex-col items-center justify-center bg-gold/10 text-gold w-16 h-16 rounded-2xl border border-gold/20 shadow-inner">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Day</span>
                                                    <span className="text-2xl font-bold leading-none mt-0.5">{dayPlan.day}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xl mb-1 text-white">{dayPlan.theme}</h4>
                                                    <span className="text-sm text-gray-400 font-medium">Budget Est. <span className="text-gold">{dayPlan.estimated_cost}</span></span>
                                                </div>
                                            </div>
                                            <div className={`p-2 rounded-full border border-white/10 transition-all ${expandedDay === dayPlan.day ? 'bg-gold/10 border-gold/30' : 'bg-black/30'}`}>
                                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedDay === dayPlan.day ? 'rotate-180 text-gold' : 'text-gray-400'}`} />
                                            </div>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {expandedDay === dayPlan.day && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.35, ease: "easeInOut" }}
                                                >
                                                    <div className="p-8 pt-2 border-t border-white/5 space-y-8">

                                                        {/* Morning */}
                                                        {dayPlan.morning && (
                                                            <div className="relative pl-8 border-l-2 border-white/10">
                                                                <div className="absolute -left-3 top-0 bg-surface p-1.5 rounded-full border border-white/5 shadow-md">
                                                                    <Sun className="w-3.5 h-3.5 text-gold" />
                                                                </div>
                                                                <h5 className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Morning</h5>
                                                                <p className="text-lg font-semibold text-white mb-2">{dayPlan.morning.activity}</p>
                                                                <p className="text-sm text-gray-400 mb-4 flex items-center gap-2 font-medium">
                                                                    <MapPin className="w-3.5 h-3.5" /> {dayPlan.morning.place}
                                                                </p>
                                                                <div className="bg-gold/5 border border-gold/10 rounded-xl p-4 text-sm text-gray-300 italic shadow-inner">
                                                                    <span className="text-gold font-bold not-italic">Insider Tip: </span> {dayPlan.morning.tip}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Afternoon */}
                                                        {dayPlan.afternoon && (
                                                            <div className="relative pl-8 border-l-2 border-white/10">
                                                                <div className="absolute -left-3 top-0 bg-surface p-1.5 rounded-full border border-white/5 shadow-md">
                                                                    <Sunset className="w-3.5 h-3.5 text-orange-400" />
                                                                </div>
                                                                <h5 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Afternoon</h5>
                                                                <p className="text-lg font-semibold text-white mb-2">{dayPlan.afternoon.activity}</p>
                                                                <p className="text-sm text-gray-400 mb-4 flex items-center gap-2 font-medium">
                                                                    <MapPin className="w-3.5 h-3.5" /> {dayPlan.afternoon.place}
                                                                </p>
                                                                <div className="bg-gold/5 border border-gold/10 rounded-xl p-4 text-sm text-gray-300 italic shadow-inner">
                                                                    <span className="text-gold font-bold not-italic">Insider Tip: </span> {dayPlan.afternoon.tip}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Evening */}
                                                        {dayPlan.evening && (
                                                            <div className="relative pl-8 border-l-2 border-transparent">
                                                                <div className="absolute -left-3 top-0 bg-surface p-1.5 rounded-full border border-white/5 shadow-md">
                                                                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                                                                </div>
                                                                <h5 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Evening</h5>
                                                                <p className="text-lg font-semibold text-white mb-2">{dayPlan.evening.activity}</p>
                                                                <p className="text-sm text-gray-400 mb-4 flex items-center gap-2 font-medium">
                                                                    <MapPin className="w-3.5 h-3.5" /> {dayPlan.evening.place}
                                                                </p>
                                                                <div className="bg-gold/5 border border-gold/10 rounded-xl p-4 text-sm text-gray-300 italic shadow-inner">
                                                                    <span className="text-gold font-bold not-italic">Insider Tip: </span> {dayPlan.evening.tip}
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-40"></div> {/* Spacer for bottom scrolling */}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background text-white flex items-center justify-center font-sans">
                <div className="animate-pulse flex flex-col items-center">
                    <Compass className="w-16 h-16 text-gold mb-6 opacity-80 animate-spin-slow" />
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
