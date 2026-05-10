import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const navigate = useNavigate();

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/trips?sort_by=${sortBy}`);
      setTrips(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [sortBy, navigate]);

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.delete(`/trips/${tripId}`);
        fetchTrips();
      } catch (err) {
        alert('Failed to delete trip');
      }
    }
  };

  const handleEdit = (tripId) => {
    alert(`Edit trip ${tripId} - Future feature placeholder`);
  };

  const handleView = (tripId) => {
    navigate(`/trips/${tripId}/itinerary`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
            <p className="text-gray-500 mt-1">Manage and organize all your travels.</p>
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            >
              <option value="created_at">Recently Created</option>
              <option value="start_date">Travel Date</option>
            </select>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/create-trip')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              + New Trip
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8 text-gray-500">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-medium text-gray-700">No trips found</h3>
            <p className="text-gray-500 mt-2">You haven't planned any trips yet.</p>
            <button 
              onClick={() => navigate('/create-trip')}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Start Planning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {trip.cover_image ? (
                  <img src={`http://localhost:8000${trip.cover_image}`} alt={trip.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                    No Cover Image
                  </div>
                )}
                
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800">{trip.title}</h2>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                      {trip.destination_count} Dest.
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {trip.description || 'No description provided.'}
                  </p>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Dates:</span>
                      <span>
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'} - 
                        {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Budget:</span>
                      <span>{trip.budget_limit ? `$${trip.budget_limit.toFixed(2)}` : 'Flexible'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex justify-between gap-2">
                  <button onClick={() => handleView(trip.id)} className="flex-1 text-indigo-600 font-medium hover:text-indigo-800 text-sm">View</button>
                  <button onClick={() => navigate(`/trips/${trip.id}/budget`)} className="flex-1 text-green-600 font-medium hover:text-green-800 text-sm">Budget</button>
                  <button onClick={() => navigate(`/trips/${trip.id}/packing`)} className="flex-1 text-blue-600 font-medium hover:text-blue-800 text-sm">Pack</button>
                  <button onClick={() => handleEdit(trip.id)} className="flex-1 text-gray-600 font-medium hover:text-gray-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(trip.id)} className="flex-1 text-red-600 font-medium hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
