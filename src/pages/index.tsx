import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { MapPin, Sun, DollarSign, CheckSquare, MessageCircle, PlusCircle } from "lucide-react"
import TripPlanner from '../components/TripPlanner'

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const API_URL = '/api';

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${API_URL}/trips`)
      if (!response.ok) {
        throw new Error('Failed to fetch trips')
      }
      const data = await response.json()
      setTrips(data)
      setIsLoading(false)
    } catch (err) {
      setError('Error fetching trips. Please try again later.')
      setIsLoading(false)
    }
  }

  const selectedTrip = trips.find(trip => trip.id === selectedTripId)

  if (isLoading) {
    return <div>Loading trips...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Travel Planner</h1>
        <p className="text-xl text-muted-foreground">Plan, organize, and enjoy your trips with ease</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Trip Planner
            </CardTitle>
            <CardDescription>Organize your travel itineraries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Active Trips</h3>
              {trips.length > 0 ? (
                <ul className="space-y-2">
                  {trips.map((trip) => (
                    <li 
                      key={trip.id} 
                      className="flex justify-between items-center bg-muted p-3 rounded-md cursor-pointer hover:bg-muted/80"
                      onClick={() => setSelectedTripId(trip.id)}
                    >
                      <span className="font-medium">{trip.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {trip.startDate} - {trip.endDate}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No active trips. Start planning your next adventure!</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/trips" passHref>
              <Button>View All Trips</Button>
            </Link>
            <Link href="/trips/new" passHref>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Plan a New Trip
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {selectedTrip && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Trip Details: {selectedTrip.name}</CardTitle>
              <CardDescription>{selectedTrip.startDate} - {selectedTrip.endDate}</CardDescription>
            </CardHeader>
            <CardContent>
              <TripPlanner trips={trips} setTrips={setTrips} />
            </CardContent>
            <CardFooter>
              <Button onClick={() => setSelectedTripId(null)}>Close</Button>
            </CardFooter>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Weather Forecast
            </CardTitle>
            <CardDescription>Check the weather for your destinations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Get up-to-date weather information for your travel locations.</p>
          </CardContent>
          <CardFooter>
            <Link href="/weather" passHref>
              <Button>Check Weather</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Converter
            </CardTitle>
            <CardDescription>Convert between different currencies</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Easily convert currencies to help with your travel budget.</p>
          </CardContent>
          <CardFooter>
            <Link href="/currency" passHref>
              <Button>Convert Currency</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Todo List
            </CardTitle>
            <CardDescription>Keep track of your travel tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create and manage todo lists for your trips to stay organized.</p>
          </CardContent>
          <CardFooter>
            <Link href="/todo" passHref>
              <Button>Manage Tasks</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AI Travel Assistant
            </CardTitle>
            <CardDescription>Get personalized travel advice</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Chat with our AI assistant for travel tips and recommendations.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => alert("AI assistant is available on all pages!")}>Chat Now</Button>
          </CardFooter>
        </Card>
      </div>

      <footer className="mt-12 text-center text-muted-foreground">
        <p>Start planning your next adventure today!</p>
      </footer>
    </div>
  )
}
