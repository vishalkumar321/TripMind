'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface SlotData {
    activity: string; place: string; tip: string; lat?: number; lng?: number;
}
interface TripContext {
    id: string; title: string; destination: string;
    days: number; budget: string; style: string;
    itinerary: {
        summary: string; total_estimated_cost: string;
        hidden_gems: string[]; packing_tips: string[];
        days: { day: number; theme: string; estimated_cost: string; morning: SlotData; afternoon: SlotData; evening: SlotData }[];
    };
}

interface Message { role: 'user' | 'ai'; content: string; }

interface ChatPanelProps { trip: TripContext | null; }

const SUGGESTIONS = [
    'Best time to visit?',
    'Cheaper alternative for Day 1?',
    'Local restaurant near the hotel?',
    'How to get around cheaply?',
];

export default function ChatPanel({ trip }: ChatPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll on new message
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    // Reset chat when trip changes
    useEffect(() => { setMessages([]); }, [trip?.id]);

    const sendMessage = async (text?: string) => {
        const msg = (text ?? input).trim();
        if (!msg || !trip) return;
        setInput('');
        setMessages((p) => [...p, { role: 'user', content: msg }]);
        setIsTyping(true);
        try {
            const token = Cookies.get('token');
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await axios.post(
                `${API}/trips/chat`,
                {
                    message: msg,
                    tripContext: {
                        title: trip.title, destination: trip.destination,
                        days: trip.days, budget: trip.budget, style: trip.style,
                        itinerary: trip.itinerary
                    }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages((p) => [...p, { role: 'ai', content: res.data.reply }]);
        } catch {
            setMessages((p) => [...p, { role: 'ai', content: "I'm having trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* ── FLOATING BUTTON ── */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen((o) => !o)}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    width: '56px', height: '56px', borderRadius: '100px',
                    background: isOpen ? 'var(--dark)' : 'var(--accent)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(224,123,79,0.35)', zIndex: 200,
                    transition: 'background 0.2s',
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X className="w-5 h-5 text-white" /></motion.div>
                        : <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><MessageCircle className="w-5 h-5 text-white" /></motion.div>
                    }
                </AnimatePresence>
            </motion.button>

            {/* ── CHAT PANEL ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{
                            position: 'fixed', bottom: '6.5rem', right: '2rem',
                            width: '380px', height: '520px',
                            background: 'var(--surface)',
                            borderRadius: '20px', border: '1.5px solid var(--border)',
                            boxShadow: '0 24px 64px rgba(26,26,46,0.18)',
                            zIndex: 199, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid var(--border)', background: 'var(--dark)', flexShrink: 0 }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(224,123,79,0.2)' }}>
                                    <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                </div>
                                <div>
                                    <p className="font-sora font-semibold text-sm text-white leading-tight">TripMind Assistant</p>
                                    <p className="font-sora text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                        {trip ? `Helping with ${trip.destination}` : 'Select a trip to get context'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3" style={{ minHeight: 0 }}>
                            {messages.length === 0 && (
                                <div className="text-center pt-6 pb-4">
                                    <p className="font-fraunces italic text-xl mb-2" style={{ color: 'var(--muted)' }}>Ask me anything ✨</p>
                                    <p className="font-sora text-xs mb-5" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                                        {trip
                                            ? `I know everything about your ${trip.destination} trip.`
                                            : 'Select a trip from the sidebar for context-aware answers.'}
                                    </p>
                                    {/* Quick suggestion pills */}
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {SUGGESTIONS.map((s) => (
                                            <button
                                                key={s} onClick={() => sendMessage(s)}
                                                className="font-sora text-xs font-semibold px-3 py-1.5"
                                                style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div style={{
                                        maxWidth: '82%',
                                        padding: '0.6rem 0.9rem',
                                        borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: m.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                                        color: m.role === 'user' ? '#fff' : 'var(--text)',
                                        border: m.role === 'ai' ? '1.5px solid var(--border)' : 'none',
                                        fontFamily: 'var(--font-sora)', fontSize: '13px', lineHeight: 1.55,
                                    }}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div style={{ padding: '0.65rem 0.9rem', borderRadius: '16px 16px 16px 4px', background: 'var(--bg)', border: '1.5px solid var(--border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        {[0, 1, 2].map((i) => (
                                            <motion.span key={i}
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                                                style={{ width: 6, height: 6, borderRadius: '100px', background: 'var(--muted)', display: 'block' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '0.75rem', borderTop: '1.5px solid var(--border)', flexShrink: 0 }}>
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    placeholder={trip ? 'Ask about this trip…' : 'Select a trip first…'}
                                    disabled={!trip || isTyping}
                                    style={{
                                        flex: 1, background: 'var(--bg)',
                                        border: '1.5px solid var(--border)', borderRadius: '12px',
                                        padding: '0.6rem 0.85rem', fontFamily: 'var(--font-sora)',
                                        fontSize: '13px', color: 'var(--text)', outline: 'none',
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || !trip || isTyping}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                                        background: input.trim() && trip && !isTyping ? 'var(--accent)' : 'var(--border)',
                                        border: 'none', cursor: input.trim() && trip && !isTyping ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
