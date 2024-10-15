import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
}

interface MapViewProps {
  activities: {
    id: number;
    title: string;
    location: string;
    latitude: number;
    longitude: number;
  }[];
}

const MapView: React.FC<MapViewProps> = ({ activities }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = activities.length > 0
    ? { lat: activities[0].latitude, lng: activities[0].longitude }
    : { lat: 0, lng: 0 };

  const locations: Location[] = activities.map(activity => ({
    lat: activity.latitude,
    lng: activity.longitude,
  }));

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={10}
    >
      {activities.map((activity) => (
        <Marker
          key={activity.id}
          position={{ lat: activity.latitude, lng: activity.longitude }}
          title={activity.title}
        />
      ))}
      <Polyline
        path={locations}
        options={{
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
        }}
      />
    </GoogleMap>
  );
};

export default MapView;
