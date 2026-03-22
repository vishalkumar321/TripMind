'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

interface PackingChecklistProps {
    tips: string[];
    tripId: string;
}

interface Item { text: string; checked: boolean; custom: boolean; }

export default function PackingChecklist({ tips, tripId }: PackingChecklistProps) {
    const storageKey = `packing_${tripId}`;

    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState('');

    // Load from localStorage or seed from tips
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setItems(JSON.parse(saved));
            } else {
                setItems(tips.map((t) => ({ text: t, checked: false, custom: false })));
            }
        } catch {
            setItems(tips.map((t) => ({ text: t, checked: false, custom: false })));
        }
    }, [storageKey, tips]);

    // Persist to localStorage whenever items change
    useEffect(() => {
        if (items.length > 0) localStorage.setItem(storageKey, JSON.stringify(items));
    }, [items, storageKey]);

    const toggle = (i: number) =>
        setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item));

    const addItem = () => {
        const t = newItem.trim();
        if (!t) return;
        setItems((prev) => [...prev, { text: t, checked: false, custom: true }]);
        setNewItem('');
    };

    const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

    const checkAll = () => setItems((p) => p.map((item) => ({ ...item, checked: true })));
    const clearAll = () => setItems((p) => p.map((item) => ({ ...item, checked: false })));
    const resetItems = () => { localStorage.removeItem(storageKey); setItems(tips.map((t) => ({ text: t, checked: false, custom: false }))); };

    const checkedCount = items.filter((i) => i.checked).length;
    const total = items.length;
    const progress = total > 0 ? (checkedCount / total) * 100 : 0;

    return (
        <div>
            {/* Progress header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-fraunces font-semibold text-xl" style={{ color: 'var(--text)' }}>Packing List</h3>
                <span className="font-sora text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                    {checkedCount} / {total} packed
                </span>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '100px', marginBottom: '1.25rem', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${progress}%`,
                    background: progress === 100 ? '#3ca078' : 'var(--accent)',
                    borderRadius: '100px', transition: 'width 0.4s ease',
                }} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-4">
                <button onClick={checkAll} className="font-sora text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5"
                    style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)', cursor: 'pointer' }}>
                    <CheckSquare className="w-3.5 h-3.5" /> Check all
                </button>
                <button onClick={clearAll} className="font-sora text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5"
                    style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)', cursor: 'pointer' }}>
                    <Square className="w-3.5 h-3.5" /> Clear all
                </button>
                <button onClick={resetItems} className="font-sora text-xs font-semibold px-3 py-1.5"
                    style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--muted)', cursor: 'pointer' }}>
                    Reset
                </button>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 mb-4">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <button
                            onClick={() => toggle(i)}
                            style={{
                                width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                                background: item.checked ? 'var(--accent)' : 'var(--bg)',
                                border: `1.5px solid ${item.checked ? 'var(--accent)' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            {item.checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </button>
                        <span className="flex-1 font-sora text-sm" style={{
                            color: item.checked ? 'var(--muted)' : 'var(--text)',
                            textDecoration: item.checked ? 'line-through' : 'none',
                            transition: 'all 0.2s',
                        }}>
                            {item.text}
                            {item.custom && (
                                <span className="ml-2 text-xs px-1.5" style={{ background: 'rgba(224,123,79,0.1)', color: 'var(--accent)', borderRadius: '6px' }}>custom</span>
                            )}
                        </span>
                        {item.custom && (
                            <button onClick={() => removeItem(i)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px' }}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add custom item */}
            <div className="flex gap-2">
                <input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
                    placeholder="Add a custom item…"
                    style={{
                        flex: 1, background: 'var(--bg)',
                        border: '1.5px solid var(--border)', borderRadius: '12px',
                        padding: '0.55rem 0.85rem', fontFamily: 'var(--font-sora)',
                        fontSize: '13px', color: 'var(--text)', outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                />
                <button
                    onClick={addItem}
                    disabled={!newItem.trim()}
                    style={{
                        width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                        background: newItem.trim() ? 'var(--accent)' : 'var(--border)',
                        border: 'none', cursor: newItem.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s',
                    }}
                >
                    <Plus className="w-4 h-4 text-white" />
                </button>
            </div>

            {progress === 100 && total > 0 && (
                <div className="mt-4 p-3 text-center font-sora text-sm font-semibold"
                    style={{ background: 'rgba(60,160,120,0.08)', border: '1px solid rgba(60,160,120,0.25)', borderRadius: '12px', color: '#3ca078' }}>
                    ✓ All packed — you&apos;re ready to go! 🎒
                </div>
            )}
        </div>
    );
}
