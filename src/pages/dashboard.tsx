import { useState, useEffect } from 'react'
import { Bell, Calendar, Home, Luggage, Map, Menu, Plus, Settings, User } from "lucide-react"
import Link from "next/link"

import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

interface Trip {
  id: number
  destination: string
  start_date: string
  end_date: string
  activities: string[]
}

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/trips')
        if (!response.ok) {
          throw new Error('Failed to fetch trips')
        }
        const data = await response.json()
        setTrips(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch trips. Please try again later.')
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  const upcomingTrips = trips.filter(trip => new Date(trip.start_date) > new Date()).slice(0, 2)
  const recentActivities = trips.slice(0, 2).map(trip => ({
    action: `Added trip to ${trip.destination}`,
    date: new Date(trip.start_date).toLocaleDateString()
  }))

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="hidden w-64 overflow-y-auto border-r bg-gray-50 dark:bg-gray-800 md:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Trip Planner</span>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            <Link
              href="#"
              className="flex items-center rounded-lg bg-gray-200 px-2 py-2 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            >
              <Home className="mr-3 h-6 w-6" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="flex items-center rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Luggage className="mr-3 h-6 w-6" />
              My Trips
            </Link>
            <Link
              href="#"
              className="flex items-center rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Map className="mr-3 h-6 w-6" />
              Explore
            </Link>
            <Link
              href="#"
              className="flex items-center rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Settings className="mr-3 h-6 w-6" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b bg-white px-4 py-2 dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Trips</CardTitle>
                <CardDescription>Your next adventures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingTrips.map(trip => (
                    <div key={trip.id} className="flex items-center justify-between">
                      <span className="font-medium">{trip.destination}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(trip.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest trip planning actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{activity.action}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{activity.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your next trip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Trip
                  </Button>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
