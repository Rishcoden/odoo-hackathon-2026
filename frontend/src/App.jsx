import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import StopActivities from './pages/StopActivities';
import Budget from './pages/Budget';
import PackingList from './pages/PackingList';
import PublicItinerary from './pages/PublicItinerary';
import Analytics from './pages/Analytics';
import TripNotes from './pages/TripNotes';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes without Navbar */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/shared/:token" element={<PublicItinerary />} />

        {/* Protected Routes wrapped in Global Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/create-trip" element={<Layout><CreateTrip /></Layout>} />
        <Route path="/my-trips" element={<Layout><MyTrips /></Layout>} />
        <Route path="/trips/:id/itinerary" element={<Layout><ItineraryBuilder /></Layout>} />
        <Route path="/trips/:tripId/stops/:stopId/activities" element={<Layout><StopActivities /></Layout>} />
        <Route path="/trips/:id/budget" element={<Layout><Budget /></Layout>} />
        <Route path="/trips/:id/packing" element={<Layout><PackingList /></Layout>} />
        <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
        <Route path="/trips/:id/notes" element={<Layout><TripNotes /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
