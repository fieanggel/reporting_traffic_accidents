"use client";

import { useEffect } from "react";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

type LocationPoint = {
  latitude: number;
  longitude: number;
};

type LocationPickerMapProps = LocationPoint & {
  onLocationChange: (point: LocationPoint) => void;
};

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (point: LocationPoint) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function SyncMapCenter({ latitude, longitude }: LocationPoint) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerMapProps) {
  const position: LatLngExpression = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SyncMapCenter latitude={latitude} longitude={longitude} />
      <MapClickHandler onLocationChange={onLocationChange} />

      <Marker
        draggable
        icon={markerIcon}
        position={position}
        eventHandlers={{
          dragend: (event) => {
            const marker = event.target as L.Marker;
            const point = marker.getLatLng();
            onLocationChange({
              latitude: point.lat,
              longitude: point.lng,
            });
          },
        }}
      />
    </MapContainer>
  );
}
