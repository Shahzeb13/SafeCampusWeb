export type MarkerType = 'user' | 'sos' | 'hospital' | 'police' | 'incident';
export type MarkerStatus = 'active' | 'resolved' | 'pending' | 'offline';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type: MarkerType;
  status?: MarkerStatus;
  time?: string;
  locationDetails?: string;
}

export interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string; // To allow external styling like height
  geofenceRadius?: number; // in meters
  geofenceCenter?: [number, number]; // [latitude, longitude]
}

