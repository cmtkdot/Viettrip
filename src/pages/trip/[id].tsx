import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MapView from '../../components/MapView';

interface Activity {
  id: number;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
}

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
}

const TripDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTripData(id as string);
    }
  }, [id]);

  const fetchTripData = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trip data');
      }
      const data = await response.json();
      setTrip(data);
    } catch (err) {
      setError('Error fetching trip data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!trip) {
    return <div>Trip not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{trip.name}</h1>
      <p className="mb-4">
        {new Date(trip.startDate).toLocaleDateString()} to {new Date(trip.endDate).toLocaleDateString()}
      </p>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Trip Map</h2>
        <MapView activities={trip.activities} />
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Activities</h2>
        <ul className="space-y-4">
          {trip.activities.map((activity) => (
            <li key={activity.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{activity.title}</h3>
              <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {activity.startTime} - {activity.endTime}</p>
              <p><strong>Location:</strong> {activity.location}</p>
              <p><strong>Category:</strong> {activity.category}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TripDetailPage;
