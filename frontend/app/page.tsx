"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BrainCircuit, Gem, Map, Plane, Sparkles, Search } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const fadeUpProps = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: 'easeOut' as const, delay },
});

const STYLES = ["Backpacker", "Budget", "Mid-range", "Luxury"];
const PACES = ["Slow & relaxed", "Balanced", "Fast & packed"];

export default function LandingPage() {
  const router = useRouter();

  // Trip input state
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<number | "">("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [style, setStyle] = useState("Mid-range");
  const [pace, setPace] = useState("Balanced");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token) { router.push("/auth/login"); return; }
    if (!description || !days || !budget) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/trips/generate",
        { description, days: Number(days), budget, currency, style, pace },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/dashboard?trip_id=${res.data.id}`);
    } catch {
      setIsLoading(false);
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* ── NAVBAR ── */}
      <nav style={{ background: "var(--dark)" }} className="fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-fraunces font-semibold text-white tracking-wide">
            Trip<span style={{ color: "var(--accent)" }}>Mind</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-sora text-white/70 hover:text-white transition-colors">Features</a>
            <a href="#how" className="text-sm font-sora text-white/70 hover:text-white transition-colors">How it works</a>
            <Link href="/auth/login" className="text-sm font-sora text-white/70 hover:text-white transition-colors">Sign In</Link>
          </div>

          {/* CTA */}
          <Link
            href="/auth/signup"
            className="btn-primary text-sm hidden md:inline-flex"
            style={{ background: "var(--accent)", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
          >
            Start Free →
          </Link>
          <Link href="/auth/signup" className="md:hidden text-sm font-semibold" style={{ color: "var(--accent)" }}>
            Sign up
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Radial gradient blobs */}
        <div
          className="pointer-events-none absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #E07B4F 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="pointer-events-none absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #4f8fe0 0%, transparent 70%)", filter: "blur(100px)" }}
        />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Eyebrow tag */}
          <motion.div {...fadeUpProps(0)} className="mb-6 flex justify-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full"
              style={{ background: "rgba(224,123,79,0.12)", color: "var(--accent)", border: "1px solid rgba(224,123,79,0.3)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Travel Planning
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUpProps(0.1)}
            className="font-fraunces font-semibold leading-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.1, color: "var(--text)" }}
          >
            Your trip,{" "}
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>actually</em>{" "}
            planned for you.
          </motion.h1>

          <motion.p
            {...fadeUpProps(0.2)}
            className="font-sora mb-10 max-w-xl mx-auto"
            style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.7 }}
          >
            Describe your dream trip in plain language — TripMind&apos;s AI builds a full day-by-day itinerary with maps, hidden gems, and budget estimates in seconds.
          </motion.p>

          <motion.div {...fadeUpProps(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="btn-primary"
              style={{ fontSize: "15px", paddingLeft: "2rem", paddingRight: "2rem" }}
            >
              Start Planning Free
            </Link>
            <a
              href="#how"
              className="font-sora font-semibold px-8 py-3 rounded-full transition-all hover:-translate-y-0.5"
              style={{ border: "1.5px solid var(--border)", color: "var(--text)", fontSize: "15px" }}
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: BrainCircuit,
              iconBg: "rgba(224,123,79,0.12)",
              iconColor: "var(--accent)",
              title: "AI Itineraries",
              desc: "Gemini builds a full day-by-day plan tailored to your style, pace, and budget.",
            },
            {
              icon: Map,
              iconBg: "rgba(79,143,224,0.12)",
              iconColor: "#4f8fe0",
              title: "Interactive Map",
              desc: "Every activity is pinned with real GPS coordinates. Visualize your whole journey at a glance.",
            },
            {
              icon: Gem,
              iconBg: "rgba(60,160,120,0.12)",
              iconColor: "#3ca078",
              title: "Hidden Gems",
              desc: "Discover off-the-beaten-path spots curated specifically for your travel preferences.",
            },
          ].map(({ icon: Icon, iconBg, iconColor, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: 'easeOut' as const, delay: i * 0.1 }}
              className="card-hover p-8"
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: "20px",
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl mb-5"
                style={{ background: iconBg }}
              >
                <Icon className="w-6 h-6" style={{ color: iconColor }} strokeWidth={1.75} />
              </div>
              <h3
                className="font-fraunces font-semibold text-xl mb-3"
                style={{ color: "var(--text)" }}
              >
                {title}
              </h3>
              <p className="font-sora text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2
              className="font-fraunces font-semibold mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--text)" }}
            >
              Three steps to your perfect trip
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, step: "01", title: "Describe your trip", desc: "Tell us your destination, vibe, budget, and how many days." },
              { icon: Sparkles, step: "02", title: "AI builds your plan", desc: "Gemini generates a detailed itinerary with GPS-pinned activities and insider tips." },
              { icon: Plane, step: "03", title: "Travel", desc: "Open your dashboard, consult the map, and explore with confidence." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: 'easeOut' as const, delay: ['01', '02', '03'].indexOf(step) * 0.1 }}
                className="card-hover p-8 relative overflow-hidden"
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "20px",
                }}
              >
                <span
                  className="absolute -top-4 -right-4 font-fraunces font-semibold select-none pointer-events-none"
                  style={{ fontSize: "6rem", lineHeight: 1, color: "rgba(26,26,46,0.04)" }}
                >
                  {step}
                </span>
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-full mb-5"
                  style={{ background: "rgba(224,123,79,0.1)", color: "var(--accent)" }}
                >
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h3 className="font-fraunces font-semibold text-lg mb-2" style={{ color: "var(--text)" }}>
                  {title}
                </h3>
                <p className="font-sora text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRIP INPUT SECTION ── */}
      <section className="py-20 px-6" style={{ background: "var(--dark)" }}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2
              className="font-fraunces font-light italic text-white mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Where are you headed?
            </h2>
            <p className="text-white/50 font-sora text-sm">
              Describe your trip and we&apos;ll build the perfect plan.
            </p>
          </motion.div>

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="5 days in Rajasthan — love street food and architecture, hate tourist crowds, budget ₹30k"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.07)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "1rem 1.25rem",
                color: "#fff",
                fontFamily: "var(--font-sora)",
                fontSize: "15px",
                outline: "none",
                resize: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
            />

            {/* Days + Budget */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                min={1} max={30}
                required
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                placeholder="Days (e.g. 5)"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  color: "#fff",
                  fontFamily: "var(--font-sora)",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
              <div className="flex" style={{ border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.07)" }}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ background: "transparent", color: "rgba(255,255,255,0.7)", padding: "0.75rem 0.5rem 0.75rem 0.75rem", fontSize: "14px", outline: "none", borderRight: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <option value="INR" style={{ background: "#1a1a2e" }}>INR</option>
                  <option value="USD" style={{ background: "#1a1a2e" }}>USD</option>
                  <option value="EUR" style={{ background: "#1a1a2e" }}>EUR</option>
                </select>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Budget"
                  style={{ flex: 1, background: "transparent", color: "#fff", padding: "0.75rem 0.75rem", fontSize: "15px", outline: "none" }}
                />
              </div>
            </div>

            {/* Travel Style pills */}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 font-sora">Travel Style</p>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s} type="button"
                    onClick={() => setStyle(s)}
                    style={{
                      padding: "0.45rem 1.1rem",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "var(--font-sora)",
                      border: style === s ? "1.5px solid var(--accent)" : "1.5px solid rgba(255,255,255,0.15)",
                      background: style === s ? "var(--accent)" : "transparent",
                      color: style === s ? "#fff" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Pace pills */}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 font-sora">Trip Pace</p>
              <div className="flex flex-wrap gap-2">
                {PACES.map((p) => (
                  <button
                    key={p} type="button"
                    onClick={() => setPace(p)}
                    style={{
                      padding: "0.45rem 1.1rem",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "var(--font-sora)",
                      border: pace === p ? "1.5px solid var(--accent)" : "1.5px solid rgba(255,255,255,0.15)",
                      background: pace === p ? "var(--accent)" : "transparent",
                      color: pace === p ? "#fff" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "100px",
                padding: "0.9rem 2rem",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: "var(--font-sora)",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => { if (!isLoading) (e.target as HTMLElement).style.background = "var(--accent-dark)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "var(--accent)"; }}
            >
              {isLoading ? "Building your itinerary..." : "Generate Itinerary →"}
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6" style={{ background: "var(--dark)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-fraunces font-semibold text-white">
            Trip<span style={{ color: "var(--accent)" }}>Mind</span>
          </span>
          <p className="font-sora text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Powered by Google Gemini AI
          </p>
          <div className="flex gap-6">
            <Link href="/auth/login" className="font-sora text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)" }}>Sign In</Link>
            <Link href="/auth/signup" className="font-sora text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)" }}>Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
