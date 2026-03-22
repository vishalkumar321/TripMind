'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

// ── Config ─────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { bg: string; border: string; color: string; Icon: React.ElementType }> = {
    success: { bg: 'rgba(60,160,120,0.95)', border: 'rgba(60,160,120,0.3)', color: '#fff', Icon: Check },
    error: { bg: 'rgba(224,85,85,0.95)', border: 'rgba(224,85,85,0.3)', color: '#fff', Icon: X },
    info: { bg: 'rgba(26,26,46,0.95)', border: 'rgba(224,123,79,0.4)', color: '#fff', Icon: Info },
};

// ── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((p) => [...p, { id, message, type }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
    }, []);

    const dismiss = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast tray — bottom right above chat button */}
            <div style={{ position: 'fixed', bottom: '6rem', right: '2rem', zIndex: 400, display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none' }}>
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const { bg, border, color, Icon } = TOAST_CONFIG[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.92 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                style={{
                                    background: bg, border: `1.5px solid ${border}`,
                                    borderRadius: '14px', padding: '0.75rem 1rem',
                                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    backdropFilter: 'blur(12px)',
                                    minWidth: '220px', maxWidth: '320px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto',
                                    cursor: 'pointer',
                                }}
                                onClick={() => dismiss(toast.id)}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                                <span style={{ fontFamily: 'var(--font-sora)', fontSize: '13px', fontWeight: 600, color }}>{toast.message}</span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
