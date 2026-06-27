import { useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Search } from 'lucide-react';

const KIGALI = { lat: -1.9441, lng: 30.0619 };
const MAP_STYLE = { width: '100%', height: '300px', borderRadius: '12px' };
const LIBRARIES: ('places')[] = ['places'];

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, address?: string) => void;
}

export default function MapPicker({ lat, lng, onChange }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const center = lat && lng ? { lat, lng } : KIGALI;
  const position = lat && lng ? { lat, lng } : null;

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) onChange(e.latLng.lat(), e.latLng.lng());
    },
    [onChange]
  );

  const handleMarkerDrag = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) onChange(e.latLng.lat(), e.latLng.lng());
    },
    [onChange]
  );

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const newLat = place.geometry.location.lat();
      const newLng = place.geometry.location.lng();
      onChange(newLat, newLng, place.formatted_address);
      mapRef.current?.panTo({ lat: newLat, lng: newLng });
      mapRef.current?.setZoom(16);
    }
  }, [onChange]);

  if (loadError) return <div className="p-4 text-sm text-red-500">Failed to load Google Maps.</div>;
  if (!isLoaded) return <div className="h-80 rounded-xl bg-gray-100 animate-pulse" />;

  return (
    <div className="space-y-2">
      {/* Search box */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] pointer-events-none" />
        <Autocomplete
          onLoad={(ac) => { autocompleteRef.current = ac; }}
          onPlaceChanged={handlePlaceChanged}
          options={{ componentRestrictions: { country: 'rw' } }}
        >
          <input
            type="text"
            placeholder="Search for an address in Rwanda..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E0E0E0] rounded-xl outline-none focus:border-primary transition-colors"
          />
        </Autocomplete>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={MAP_STYLE}
        center={center}
        zoom={position ? 15 : 13}
        onClick={handleClick}
        onLoad={(map) => { mapRef.current = map; }}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      >
        {position && (
          <Marker position={position} draggable onDragEnd={handleMarkerDrag} />
        )}
      </GoogleMap>

      {/* Coordinates */}
      <div className="flex gap-4 text-xs text-[#757575]">
        {position ? (
          <>
            <span>Lat: <strong className="text-[#1A1A1A]">{position.lat.toFixed(6)}</strong></span>
            <span>Lng: <strong className="text-[#1A1A1A]">{position.lng.toFixed(6)}</strong></span>
          </>
        ) : (
          <span>Search for an address or click the map to pin the location</span>
        )}
      </div>
    </div>
  );
}
