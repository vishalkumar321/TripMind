'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Sparkles, Map, IndianRupee, DollarSign, Euro } from 'lucide-react';
import axios from 'axios';

const LOADING_MESSAGES = [
    "Thinking about your trip...",
    "Finding hidden gems...",
    "Building your itinerary..."
];

export default function PlanPage() {
    const router = useRouter();
    const [description, setDescription] = useState('');
    const [days, setDays] = useState<number | ''>('');
    const [budget, setBudget] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [style, setStyle] = useState('Mid-range');
    const [pace, setPace] = useState('Balanced');

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

    // Protected route check
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/auth/login');
        }
    }, [router]);

    // Loading message cycler
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !days || !budget) return;

        setIsLoading(true);

        const token = Cookies.get('token');
        try {
            const response = await axios.post('http://localhost:8000/trips/generate', {
                description,
                days: Number(days),
                budget,
                currency,
                style,
                pace
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const tripId = response.data?.id || 'new-trip-123';
            router.push(`/dashboard?trip_id=${tripId}`);
        } catch (error: any) {
            console.error("Backend generation failed", error);
            if (error.response?.status === 401) {
                Cookies.remove('token');
                router.push('/auth/login');
                return;
            }
            setIsLoading(false);
            alert('API Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const formVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                <motion.div
                    animate={{ x: [0, 40, -40, 0], y: [0, -20, 10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="relative z-10"
                >
                    <Plane className="w-20 h-20 text-gold mb-10 drop-shadow-[0_0_15px_rgba(201,169,110,0.5)]" />
                </motion.div>

                <div className="h-10 relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={loadingMsgIdx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            className="text-3xl font-playfair font-semibold text-gold tracking-wide text-center"
                        >
                            {LOADING_MESSAGES[loadingMsgIdx]}
                        </motion.h2>
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white py-16 px-6 font-sans relative overflow-x-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-[600px] mx-auto relative z-10">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-gold mb-4 leading-tight">Design your journey</h1>
                    <p className="text-gray-400 text-lg">Tell us what you love, and AI will craft the perfect itinerary.</p>
                </header>

                <motion.form
                    initial="hidden"
                    animate="visible"
                    variants={formVariants}
                    onSubmit={handleSubmit}
                    className="bg-surface p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl space-y-8 relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-[80px] -z-10" />

                    {/* Describe Trip */}
                    <motion.div variants={itemVariants}>
                        <label className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-200">
                            <Sparkles className="w-4 h-4 text-gold" /> Describe your trip...
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-5 text-lg text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none placeholder-gray-600 shadow-inner"
                            placeholder="5 days in Rajasthan, hate tourist crowds, love food and architecture, budget ₹30k"
                        />
                    </motion.div>

                    {/* Days & Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-200">
                                <Map className="w-4 h-4 text-gold" /> How many days?
                            </label>
                            <input
                                type="number"
                                min="1" max="30"
                                required
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-lg text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-inner"
                                placeholder="e.g. 5"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-200">
                                <DollarSign className="w-4 h-4 text-gold" /> Total Budget
                            </label>
                            <div className="flex bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-gold focus-within:ring-1 focus-within:ring-gold transition-all shadow-inner">
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="bg-transparent text-gray-300 font-medium pl-4 py-4 pr-1 outline-none cursor-pointer border-r border-white/10 hover:text-white"
                                >
                                    <option value="INR" className="bg-surface text-white">INR</option>
                                    <option value="USD" className="bg-surface text-white">USD</option>
                                    <option value="EUR" className="bg-surface text-white">EUR</option>
                                </select>
                                <input
                                    type="number"
                                    required
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="w-full bg-transparent p-4 text-lg text-white outline-none"
                                    placeholder="30000"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Travel Style */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-semibold mb-4 text-gray-200">Travel Style</label>
                        <div className="flex flex-wrap gap-3">
                            {['Backpacker', 'Budget', 'Mid-range', 'Luxury'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStyle(s)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${style === s
                                        ? 'bg-gold/20 text-gold border border-gold/50 shadow-[0_0_15px_rgba(201,169,110,0.15)] scale-105'
                                        : 'bg-black/30 text-gray-400 border border-white/5 hover:border-white/20 hover:text-gray-200 hover:bg-white/5'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Pace */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-semibold mb-4 text-gray-200">Trip Pace</label>
                        <div className="flex flex-wrap gap-3">
                            {['Slow & relaxed', 'Balanced', 'Fast & packed'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPace(p)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${pace === p
                                        ? 'bg-gold/20 text-gold border border-gold/50 shadow-[0_0_15px_rgba(201,169,110,0.15)] scale-105'
                                        : 'bg-black/30 text-gray-400 border border-white/5 hover:border-white/20 hover:text-gray-200 hover:bg-white/5'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={itemVariants} className="pt-6">
                        <button
                            type="submit"
                            className="w-full bg-gold text-black py-4 rounded-xl font-bold text-lg hover:bg-gold/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(201,169,110,0.3)] flex justify-center items-center gap-2"
                        >
                            Generate My Itinerary
                        </button>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
}
