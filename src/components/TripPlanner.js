import React, { useState } from 'react';
import AIChatbot from './AIChatbot';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const TripPlanner = () => {
  const [activities, setActivities] = useState([]);

  const handleAddActivity = (activity) => {
    setActivities([...activities, activity]);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Trip Planner</h1>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <AIChatbot onAddActivity={handleAddActivity} />
        </div>
        <div className="w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Your Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
