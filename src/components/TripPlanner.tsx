import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface TripPlannerProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const API_URL = process.env.NODE_ENV === 'production' ? 'https://vietnamtrip.replit.app:3000/api' : '/api';

const TripPlanner: React.FC<TripPlannerProps> = ({ trips, setTrips }) => {
  const [newTrip, setNewTrip] = useState<Trip>({ id: 0, name: '', startDate: '', endDate: '', createdAt: '' });
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${API_URL}/trips`);
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      setTrips(data);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setErrorMessage('Error fetching trips. Please try again later.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTrip({ ...newTrip, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTrip.name && newTrip.startDate && newTrip.endDate) {
      try {
        const response = await fetch(`${API_URL}/trips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTrip),
        });
        if (!response.ok) {
          throw new Error('Failed to add trip');
        }
        const addedTrip = await response.json();
        setTrips([...trips, addedTrip]);
        setNewTrip({ id: 0, name: '', startDate: '', endDate: '', createdAt: '' });
        setSelectedTrip(addedTrip);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error adding trip:', error);
        setErrorMessage('Error adding trip. Please try again.');
      }
    }
  };

  const handleDeleteTrip = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/trips/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }
      setTrips(trips.filter(trip => trip.id !== id));
      if (selectedTrip && selectedTrip.id === id) {
        setSelectedTrip(null);
      }
      setErrorMessage(null);
    } catch (error) {
      console.error('Error deleting trip:', error);
      setErrorMessage('Error deleting trip. Please try again.');
    }
  };

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  useEffect(() => {
    if (selectedTrip) {
      setMapCenter({
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180
      });
    }
  }, [selectedTrip]);

  const generateWeeklyView = (trip: Trip): React.ReactNode[] => {
    if (!trip) return [];

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeklyView: React.ReactNode[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      weeklyView.push(
        <Card key={i} className="mb-4">
          <CardHeader>
            <CardTitle>{currentDate.toDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Plan your activities for this day</p>
          </CardContent>
        </Card>
      );
    }

    return weeklyView;
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'map' : 'list');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Plan Your Trip</h2>
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <div className="mb-4">
        <Button onClick={toggleViewMode}>{viewMode === 'list' ? 'Map View' : 'List View'}</Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <Input
          type="text"
          name="name"
          value={newTrip.name}
          onChange={handleInputChange}
          placeholder="Enter trip name"
          required
        />
        <Input
          type="date"
          name="startDate"
          value={newTrip.startDate}
          onChange={handleInputChange}
          required
        />
        <Input
          type="date"
          name="endDate"
          value={newTrip.endDate}
          onChange={handleInputChange}
          required
        />
        <Button type="submit">Add Trip</Button>
      </form>
      {viewMode === 'list' ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Trips</h3>
          {trips.map(trip => (
            <Card key={trip.id} className="cursor-pointer" onClick={() => handleTripSelect(trip)}>
              <CardHeader>
                <CardTitle>{trip.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dates: {trip.startDate} to {trip.endDate}</p>
                <Button variant="destructive" onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}>Delete Trip</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="h-96 w-full">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={3}
            >
              {trips.map(trip => (
                <Marker
                  key={trip.id}
                  position={{ lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 }}
                  onClick={() => handleTripSelect(trip)}
                />
              ))}
            </GoogleMap>
          ) : (
            <div>Loading map...</div>
          )}
        </div>
      )}
      {selectedTrip && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Trip Details: {selectedTrip.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="text-lg font-semibold mb-2">Weekly Schedule</h4>
            <div className="space-y-4">
              {generateWeeklyView(selectedTrip)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TripPlanner;
