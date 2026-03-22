import { Metadata } from 'next';
import Link from 'next/link';
import ShareClientView from './ShareClientView';

interface TripData {
    id: string; title: string; destination: string;
    days: number; budget: string; style: string;
    itinerary: {
        summary: string; total_estimated_cost: string;
        hidden_gems?: string[]; packing_tips?: string[];
        days: {
            day: number; theme: string; estimated_cost: string;
            morning: { activity: string; place: string; tip: string };
            afternoon: { activity: string; place: string; tip: string };
            evening: { activity: string; place: string; tip: string };
        }[];
    };
}

async function getTrip(tripId: string): Promise<TripData | null> {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${base}/trips/public/${tripId}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { tripId: string } }): Promise<Metadata> {
    const trip = await getTrip(params.tripId);
    if (!trip) return { title: 'Trip Not Found — TripMind' };

    const desc = trip.itinerary?.summary || `A ${trip.days}-day trip to ${trip.destination}`;
    return {
        title: `${trip.title} — TripMind`,
        description: desc,
        openGraph: {
            title: `${trip.title} — TripMind`,
            description: desc,
            type: 'article',
            siteName: 'TripMind',
        },
        twitter: {
            card: 'summary',
            title: `${trip.title} — TripMind`,
            description: desc,
        },
    };
}

export default async function SharePage({ params }: { params: { tripId: string } }) {
    const trip = await getTrip(params.tripId);

    if (!trip) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8"
                style={{ background: 'var(--bg)', fontFamily: 'var(--font-sora)' }}>
                <h1 className="font-fraunces text-3xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
                    Trip not found
                </h1>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>This itinerary may have been removed or doesn&apos;t exist.</p>
                <Link href="/" style={{ background: 'var(--dark)', color: '#fff', borderRadius: '100px', padding: '0.75rem 1.75rem', textDecoration: 'none', fontFamily: 'var(--font-sora)', fontWeight: 600, fontSize: '14px' }}>
                    Go to TripMind →
                </Link>
            </div>
        );
    }

    return <ShareClientView trip={trip} />;
}
