import React from 'react';
import TripPlanner from '../components/TripPlanner';

const Home = () => {
  return (
    <div className="container mx-auto">
      <header>
        <h1 className="text-3xl font-bold my-4">Trip Planner</h1>
      </header>
      <TripPlanner />
    </div>
  );
};

export default Home;
