'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Copy, Check, Sun, Sunset, Moon, Sparkles } from 'lucide-react';

interface SlotData { activity: string; place: string; tip: string; }
interface DayPlan {
    day: number; theme: string; estimated_cost: string;
    morning: SlotData; afternoon: SlotData; evening: SlotData;
}
interface TripData {
    id: string; title: string; destination: string; days: number; budget: string;
    itinerary: { summary: string; total_estimated_cost: string; hidden_gems?: string[]; packing_tips?: string[]; days: DayPlan[] };
}

const slotIcon = { morning: <Sun className="w-3.5 h-3.5" />, afternoon: <Sunset className="w-3.5 h-3.5" />, evening: <Moon className="w-3.5 h-3.5" /> };
const slotColor = { morning: 'var(--accent)', afternoon: '#f59e0b', evening: '#818cf8' };

export default function ShareClientView({ trip }: { trip: TripData }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)', fontFamily: 'var(--font-sora)' }}>
            {/* Navbar */}
            <nav style={{ background: 'var(--dark)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/" className="font-fraunces font-semibold text-xl" style={{ color: '#fff', textDecoration: 'none' }}>
                    Trip<span style={{ color: 'var(--accent)' }}>Mind</span>
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 font-sora text-sm font-semibold px-4 py-2"
                        style={{ background: copied ? '#3ca078' : 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '100px', cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy link'}
                    </button>
                    <Link href="/auth/signup" style={{ background: 'var(--accent)', color: '#fff', borderRadius: '100px', padding: '0.5rem 1.25rem', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'background 0.2s' }}>
                        Try TripMind →
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-10">
                    <h1 className="font-fraunces font-semibold leading-tight mb-4"
                        style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', color: 'var(--text)' }}>
                        {trip.title}
                    </h1>
                    <div className="flex flex-wrap gap-3 mb-5">
                        <span className="flex items-center gap-2 text-sm font-semibold px-4 py-2"
                            style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)' }}>
                            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> {trip.destination}
                        </span>
                        <span className="flex items-center gap-2 text-sm font-semibold px-4 py-2"
                            style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)' }}>
                            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> {trip.days} Days
                        </span>
                        <span className="text-sm font-semibold px-4 py-2"
                            style={{ background: 'rgba(60,160,120,0.1)', border: '1.5px solid rgba(60,160,120,0.25)', borderRadius: '100px', color: '#3ca078' }}>
                            {trip.itinerary.total_estimated_cost}
                        </span>
                    </div>
                    {trip.itinerary.summary && (
                        <p className="font-fraunces italic text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
                            &ldquo;{trip.itinerary.summary}&rdquo;
                        </p>
                    )}
                </header>

                {/* Hidden Gems */}
                {trip.itinerary.hidden_gems && trip.itinerary.hidden_gems.length > 0 && (
                    <div className="p-6 mb-8" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '20px' }}>
                        <h2 className="font-fraunces font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Hidden Gems
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {trip.itinerary.hidden_gems.map((gem, i) => (
                                <p key={i} className="p-3 text-sm leading-snug"
                                    style={{ background: 'rgba(224,123,79,0.06)', border: '1px solid rgba(224,123,79,0.15)', borderRadius: '12px', color: 'var(--text)' }}>
                                    {gem}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Days */}
                <h2 className="font-fraunces font-semibold text-2xl mb-5" style={{ color: 'var(--text)' }}>Daily Itinerary</h2>
                <div className="space-y-5 mb-12">
                    {trip.itinerary.days?.map((d) => (
                        <div key={d.day} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div className="px-6 py-4 flex items-center gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl"
                                    style={{ background: 'rgba(224,123,79,0.1)', border: '1.5px solid rgba(224,123,79,0.2)' }}>
                                    <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>DAY</span>
                                    <span className="text-xl font-fraunces font-semibold leading-none" style={{ color: 'var(--text)' }}>{d.day}</span>
                                </div>
                                <div>
                                    <p className="font-sora font-semibold text-sm" style={{ color: 'var(--text)' }}>{d.theme}</p>
                                    <p className="text-xs font-semibold" style={{ color: '#3ca078' }}>{d.estimated_cost}</p>
                                </div>
                            </div>
                            <div className="px-6 py-5 space-y-5">
                                {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
                                    const s = d[slot];
                                    if (!s) return null;
                                    return (
                                        <div key={slot} className="relative pl-6 border-l-2" style={{ borderColor: `${slotColor[slot]}30` }}>
                                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center"
                                                style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: slotColor[slot] }}>
                                                {slotIcon[slot]}
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: slotColor[slot] }}>{slot}</p>
                                            <p className="font-sora font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{s.activity}</p>
                                            <p className="font-sora text-xs flex items-center gap-1 mb-2" style={{ color: 'var(--muted)' }}>
                                                <MapPin className="w-3 h-3 flex-shrink-0" /> {s.place}
                                            </p>
                                            <p className="text-xs italic p-3 leading-relaxed"
                                                style={{ background: `${slotColor[slot]}08`, border: `1px solid ${slotColor[slot]}20`, borderRadius: '10px', color: 'var(--text)' }}>
                                                <span className="font-semibold not-italic" style={{ color: slotColor[slot] }}>Tip: </span>{s.tip}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center p-10" style={{ background: 'var(--dark)', borderRadius: '20px' }}>
                    <h3 className="font-fraunces font-semibold text-2xl text-white mb-3">
                        Plan your own trip with TripMind →
                    </h3>
                    <p className="font-sora text-sm mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        AI-powered itineraries in seconds. No more tab-hopping.
                    </p>
                    <Link href="/auth/signup" style={{ background: 'var(--accent)', color: '#fff', borderRadius: '100px', padding: '0.85rem 2.5rem', textDecoration: 'none', fontFamily: 'var(--font-sora)', fontWeight: 600, fontSize: '15px', display: 'inline-block' }}>
                        Start for Free
                    </Link>
                </div>
            </div>
        </div>
    );
}
