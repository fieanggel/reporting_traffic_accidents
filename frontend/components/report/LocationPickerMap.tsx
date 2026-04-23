"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationPickerMapProps = {
  latitude: number;
  longitude: number;
  onLocationChange: (coordinates: Coordinates) => void;
};

type MapEventsProps = {
  onLocationChange: (lat: number, lng: number) => void;
};

let isLeafletIconFixed = false;

// Fix icon default Leaflet di Next.js
const ensureLeafletIcon = () => {
  if (isLeafletIconFixed || typeof window === "undefined") {
    return;
  }

  const iconDefaultPrototype = L.Icon.Default.prototype as unknown as {
    _getIconUrl?: unknown;
  };
  delete iconDefaultPrototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });

  isLeafletIconFixed = true;
};

// Kompnen untuk menghandle klik pada area peta
function MapEvents({ onLocationChange }: MapEventsProps) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 1000);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerMapProps) {
  ensureLeafletIcon();

  return (
    <div className="relative h-full w-full min-h-[300px]">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onLocationChange={(lat, lng) => onLocationChange({ latitude: lat, longitude: lng })} />
        
        <Marker
          position={[latitude, longitude]}
          draggable={true}
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target as L.Marker;
              const latlng = marker.getLatLng();
              onLocationChange({ latitude: latlng.lat, longitude: latlng.lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}