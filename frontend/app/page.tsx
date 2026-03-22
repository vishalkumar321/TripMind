"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, Gem, PiggyBank, Search, Sparkles, Plane } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white overflow-hidden relative font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] -z-10" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-3xl font-playfair font-bold text-gold tracking-wide">
            TripMind
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm font-medium hover:text-gold transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="text-sm font-bold bg-gold text-black px-6 py-2.5 rounded-full hover:bg-gold/90 transition-all shadow-[0_0_15px_rgba(201,169,110,0.3)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto flex flex-col items-center">
            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-8xl font-playfair font-semibold leading-tight mb-6"
            >
              Travel planning, <br />
              <span className="italic text-gold glow">finally personal.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Tell us where you want to go. We handle the rest.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mx-auto"
            >
              <Link href="/auth/signup" className="w-full sm:w-auto px-8 py-4 bg-gold text-black font-bold rounded-full text-lg hover:bg-gold/90 hover:scale-105 transition-all shadow-[0_0_25px_rgba(201,169,110,0.4)] whitespace-nowrap">
                Start Planning Free
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-bold rounded-full text-lg hover:bg-white/5 hover:border-gold/50 transition-all whitespace-nowrap">
                See How It Works
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Strip */}
        <section className="max-w-7xl mx-auto py-24 border-y border-white/5 relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-purple-900/10 rounded-full blur-[100px] -z-10" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center"
          >
            {[
              { icon: BrainCircuit, title: "AI Itineraries" },
              { icon: TrendingUp, title: "Live Prices" },
              { icon: Gem, title: "Hidden Gems" },
              { icon: PiggyBank, title: "Zero Cost" }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-white/5 flex items-center justify-center mb-6 text-gold shadow-lg shadow-black/50 hover:bg-white/5 transition-colors">
                  <feature.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-playfair font-semibold mb-3">{feature.title}</h3>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto py-32 relative">
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] -z-10" />

          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-playfair font-semibold mb-6"
            >
              How It Works
            </motion.h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Search, title: "Describe your trip", step: 1 },
              { icon: Sparkles, title: "AI builds your plan", step: 2 },
              { icon: Plane, title: "Travel", step: 3 }
            ].map((step) => (
              <motion.div key={step.step} variants={fadeUp} className="relative group text-center flex flex-col items-center">
                <div className="bg-surface border border-white/5 w-full p-10 rounded-3xl h-full hover:border-gold/30 transition-all hover:-translate-y-2 shadow-xl relative overflow-hidden flex flex-col items-center justify-center gap-6">
                  {/* Step Number Background */}
                  <span className="absolute -top-6 -right-6 text-[120px] font-playfair font-bold text-white/5 leading-none select-none pointer-events-none">
                    {step.step}
                  </span>

                  <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/20 relative z-10">
                    <step.icon className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-playfair font-bold relative z-10">{step.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background py-10 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center md:space-x-4">
          <span className="text-xl font-playfair font-bold text-gold opacity-80 mr-2">
            TripMind
          </span>
          <span className="hidden md:block text-white/20">|</span>
          <p className="text-sm text-gray-500 font-medium md:ml-2">
            Built with Claude API
          </p>
        </div>
      </footer>
    </div>
  );
}
