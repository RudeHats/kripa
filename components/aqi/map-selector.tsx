"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { AnimatedCard } from "./animated-card";

// Fix for default marker icons in Leaflet via webpack
const iconDefault = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

interface MapSelectorProps {
    onLocationSelected: (lat: number, lng: number) => void;
    initialLocation?: { lat: number; lng: number };
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={iconDefault} />
    );
}

function MapUpdater({ center }: { center: L.LatLng }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export function MapSelector({ onLocationSelected, initialLocation = { lat: 28.6139, lng: 77.2090 } }: MapSelectorProps) {
    const [position, setPosition] = useState<L.LatLng | null>(L.latLng(initialLocation.lat, initialLocation.lng));
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync external initialLocation changes down to the internal map center state
    useEffect(() => {
        if (initialLocation && initialLocation.lat && initialLocation.lng) {
            setPosition(L.latLng(initialLocation.lat, initialLocation.lng));
        }
    }, [initialLocation.lat, initialLocation.lng]);

    const handleConfirm = () => {
        if (position) {
            onLocationSelected(position.lat, position.lng);
        }
    };

    if (!isMounted) return <div className="h-[300px] bg-secondary/50 rounded-xl animate-pulse" />;

    return (
        <AnimatedCard delay={100} hover={false} className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Select Location
                </h2>
                {position && (
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Update Dashboard
                    </button>
                )}
            </div>
            <div className="h-[300px] w-full rounded-xl overflow-hidden relative border border-border/50">
                <MapContainer
                    center={[position ? position.lat : initialLocation.lat, position ? position.lng : initialLocation.lng]}
                    zoom={10}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <TileLayer
                        attribution='AQI Data &copy; WAQI'
                        url={`https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${process.env.NEXT_PUBLIC_WAQI_TOKEN || "8eb70a7316a6adf26fdc1238e30481f93590c300"}`}
                        opacity={0.6}
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                    {position && <MapUpdater center={position} />}
                </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center">
                Click anywhere on the map to pin a new location.
            </p>
        </AnimatedCard>
    );
}
