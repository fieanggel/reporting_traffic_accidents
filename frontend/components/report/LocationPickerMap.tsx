"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon default Leaflet di Next.js
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
};

// Kompnen untuk menghandle klik pada area peta
function MapEvents({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
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

export default function LocationPickerMap({ latitude, longitude, onLocationChange }: any) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fixLeafletIcon();
    setIsClient(true);
  }, []);

  if (!isClient) return null;

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
            dragend: (e) => {
              const latlng = e.target.getLatLng();
              onLocationChange({ latitude: latlng.lat, longitude: latlng.lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}