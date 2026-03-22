'use client';

import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, Printer } from 'lucide-react';

interface DayPlan {
    day: number; estimated_cost: string;
}
interface BudgetTrackerProps {
    tripId: string;
    estimatedBudget: string;   // e.g. "₹ 45,000" or "USD 1200"
    days: DayPlan[];
}

interface Expense {
    id: string;
    name: string;
    amount: number;
    category: string;
    day: number;
}

const CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Misc'];
const CATEGORY_COLORS: Record<string, string> = {
    Food: '#E07B4F',
    Transport: '#4f8fe0',
    Accommodation: '#818cf8',
    Activities: '#3ca078',
    Shopping: '#f59e0b',
    Misc: '#a1a1aa',
};

function parseBudgetNumber(raw: string): number {
    const digits = raw.replace(/[^0-9.]/g, '');
    return parseFloat(digits) || 0;
}

export default function BudgetTracker({ tripId, estimatedBudget, days }: BudgetTrackerProps) {
    const storageKey = `expenses_${tripId}`;

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [form, setForm] = useState({ name: '', amount: '', category: 'Food', day: 1 });
    const [showForm, setShowForm] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) setExpenses(JSON.parse(saved));
        } catch { /* ignore */ }
    }, [storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(expenses));
    }, [expenses, storageKey]);

    const addExpense = () => {
        const amount = parseFloat(form.amount);
        if (!form.name.trim() || !amount || amount <= 0) return;
        setExpenses((p) => [...p, { id: Date.now().toString(), name: form.name.trim(), amount, category: form.category, day: form.day }]);
        setForm({ name: '', amount: '', category: 'Food', day: 1 });
        setShowForm(false);
    };

    const removeExpense = (id: string) => setExpenses((p) => p.filter((e) => e.id !== id));

    const estimated = parseBudgetNumber(estimatedBudget);
    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = estimated - spent;
    const overBudget = remaining < 0;

    // Pie chart data — group by category
    const pieData = CATEGORIES.map((cat) => ({
        name: cat,
        value: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    })).filter((d) => d.value > 0);

    const emptyPie = [{ name: 'No expenses yet', value: 1 }];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div ref={printRef}>
            {/* ── SUMMARY CARDS ── */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Estimated', value: estimatedBudget, color: '#3ca078', bg: 'rgba(60,160,120,0.08)', border: 'rgba(60,160,120,0.25)' },
                    { label: 'Actual Spent', value: spent > 0 ? spent.toLocaleString() : '—', color: 'var(--accent)', bg: 'rgba(224,123,79,0.08)', border: 'rgba(224,123,79,0.25)' },
                    { label: 'Remaining', value: estimated > 0 ? Math.abs(remaining).toLocaleString() : '—', color: overBudget ? '#e05555' : '#3ca078', bg: overBudget ? 'rgba(224,85,85,0.08)' : 'rgba(60,160,120,0.08)', border: overBudget ? 'rgba(224,85,85,0.25)' : 'rgba(60,160,120,0.25)' },
                ].map(({ label, value, color, bg, border }) => (
                    <div key={label} className="text-center p-5"
                        style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: '16px' }}>
                        <p className="font-sora text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
                        <p className="font-fraunces font-semibold text-xl leading-tight" style={{ color: 'var(--text)' }}>
                            {label === 'Remaining' && overBudget ? '-' : ''}{value}
                        </p>
                        {label === 'Remaining' && overBudget && (
                            <p className="font-sora text-xs mt-1" style={{ color: '#e05555' }}>Over budget</p>
                        )}
                    </div>
                ))}
            </div>

            {/* ── PIE CHART ── */}
            <div className="mb-8" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
                <h3 className="font-fraunces font-semibold text-lg mb-4" style={{ color: 'var(--text)' }}>
                    Spend by Category
                </h3>
                {pieData.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={emptyPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                                    <Cell fill="var(--border)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <p className="font-sora text-sm text-center" style={{ color: 'var(--muted)', marginTop: '-1rem' }}>
                            Add expenses below to see your breakdown
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                                {pieData.map((entry) => (
                                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#a1a1aa'} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(val) => [typeof val === 'number' ? val.toLocaleString() : '', '']}
                                contentStyle={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px', fontFamily: 'var(--font-sora)', fontSize: '13px' }}
                            />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontFamily: 'var(--font-sora)', fontSize: '12px', color: 'var(--text)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── EXPENSE LIST ── */}
            <div className="mb-6" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-fraunces font-semibold text-lg" style={{ color: 'var(--text)' }}>Expenses</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 font-sora text-xs font-semibold px-3 py-1.5"
                            style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--text)', cursor: 'pointer' }}
                        >
                            <Printer className="w-3.5 h-3.5" /> Export PDF
                        </button>
                        <button
                            onClick={() => setShowForm((s) => !s)}
                            className="flex items-center gap-1.5 font-sora text-xs font-semibold px-3 py-1.5"
                            style={{ background: 'var(--accent)', border: 'none', borderRadius: '100px', color: '#fff', cursor: 'pointer' }}
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Expense
                        </button>
                    </div>
                </div>

                {/* Add expense form */}
                {showForm && (
                    <div className="mb-5 p-4" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '14px' }}>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="font-sora text-xs font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Name</label>
                                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Hotel dinner"
                                    style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-sora)', fontSize: '13px', color: 'var(--text)', outline: 'none' }} />
                            </div>
                            <div>
                                <label className="font-sora text-xs font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Amount</label>
                                <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                                    placeholder="0"
                                    style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-sora)', fontSize: '13px', color: 'var(--text)', outline: 'none' }} />
                            </div>
                            <div>
                                <label className="font-sora text-xs font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Category</label>
                                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                                    style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-sora)', fontSize: '13px', color: 'var(--text)', outline: 'none' }}>
                                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="font-sora text-xs font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Day</label>
                                <select value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: Number(e.target.value) }))}
                                    style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-sora)', fontSize: '13px', color: 'var(--text)', outline: 'none' }}>
                                    {days.map((d) => <option key={d.day} value={d.day}>Day {d.day}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowForm(false)}
                                className="font-sora text-xs font-semibold px-4 py-2"
                                style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '100px', color: 'var(--muted)', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={addExpense}
                                className="font-sora text-xs font-semibold px-4 py-2"
                                style={{ background: 'var(--dark)', border: 'none', borderRadius: '100px', color: '#fff', cursor: 'pointer' }}>
                                Add →
                            </button>
                        </div>
                    </div>
                )}

                {/* Expense rows */}
                {expenses.length === 0 ? (
                    <p className="font-sora text-sm py-4 text-center italic" style={{ color: 'var(--muted)' }}>
                        No expenses added yet. Click &quot;Add Expense&quot; to start tracking.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {expenses.map((exp) => (
                            <div key={exp.id} className="flex items-center gap-4 px-4 py-3 group"
                                style={{ background: 'var(--bg)', borderRadius: '12px', border: '1.5px solid var(--border)' }}>
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ background: CATEGORY_COLORS[exp.category] || '#a1a1aa' }} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-sora text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{exp.name}</p>
                                    <p className="font-sora text-xs" style={{ color: 'var(--muted)' }}>{exp.category} · Day {exp.day}</p>
                                </div>
                                <p className="font-fraunces font-semibold" style={{ color: 'var(--text)', whiteSpace: 'nowrap' }}>
                                    {exp.amount.toLocaleString()}
                                </p>
                                <button onClick={() => removeExpense(exp.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px' }}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
