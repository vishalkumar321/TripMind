'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Place {
    name: string;
    lat: number;
    lng: number;
    day: number;
}

interface TripMapProps {
    places: Place[];
}

function MapBounds({ places }: { places: Place[] }) {
    const map = useMap();
    useEffect(() => {
        if (places.length > 0) {
            const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, places]);
    return null;
}

const createCustomIcon = (day: number) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #c9a96e; color: #000; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; border: 2px solid #fff; box-shadow: 0 0 10px rgba(201, 169, 110, 0.5);">${day}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
};

export default function TripMap({ places }: TripMapProps) {
    const validPlaces = places.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
    const center: [number, number] = validPlaces.length > 0 ? [validPlaces[0].lat, validPlaces[0].lng] : [20, 0];
    const polylinePositions: [number, number][] = validPlaces.map(p => [p.lat, p.lng]);

    return (
        <div className="w-full h-full">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%', background: '#111118' }}
                attributionControl={false}
            >
                <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
                />
                {validPlaces.map((place, idx) => (
                    <Marker
                        key={`${place.name}-${idx}`}
                        position={[place.lat, place.lng]}
                        icon={createCustomIcon(place.day)}
                    >
                        <Popup className="custom-popup">
                            <div className="font-sans">
                                <div className="text-xs uppercase text-gray-500 font-bold tracking-widest mb-1">Day {place.day}</div>
                                <div className="font-bold text-base text-gray-900">{place.name}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {polylinePositions.length > 1 && (
                    <Polyline
                        positions={polylinePositions}
                        pathOptions={{ color: '#c9a96e', dashArray: '5, 10', weight: 4 }}
                    />
                )}
                <MapBounds places={validPlaces} />
            </MapContainer>
        </div>
    );
}
