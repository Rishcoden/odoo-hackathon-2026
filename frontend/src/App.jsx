import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import StopActivities from './pages/StopActivities';
import Budget from './pages/Budget';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-trip" element={<CreateTrip />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/trips/:id/itinerary" element={<ItineraryBuilder />} />
        <Route path="/trips/:tripId/stops/:stopId/activities" element={<StopActivities />} />
        <Route path="/trips/:id/budget" element={<Budget />} />
      </Routes>
    </Router>
  );
}

export default App;
