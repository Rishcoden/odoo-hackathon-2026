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

  const handleShare = async (tripId) => {
    try {
      const response = await api.post(`/trips/${tripId}/share`);
      if (response.data.share_url) {
        navigator.clipboard.writeText(response.data.share_url);
        alert('Public link copied to clipboard!');
      }
    } catch (err) {
      alert('Failed to generate share link');
    }
  };

  const handleView = (tripId) => {
    navigate(`/trips/${tripId}/itinerary`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">My Trips</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage, organize, and track all your travel itineraries.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 border border-slate-200 rounded-xl font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                <option value="created_at">Recently Created</option>
                <option value="start_date">Travel Date</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
              <div className="text-indigo-400 font-medium tracking-widest uppercase">Loading Trips</div>
            </div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-24 text-center px-6">
            <div className="text-6xl mb-6">🏝️</div>
            <h3 className="text-2xl font-bold text-slate-800">Your travel canvas is empty</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto font-medium">It looks like you haven't planned any trips yet. Create your first itinerary to start building memories.</p>
            <button 
              onClick={() => navigate('/create-trip')}
              className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Start Planning Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col group transform hover:-translate-y-1">
                
                {/* Image Section */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  {trip.cover_image ? (
                    <img src={`http://localhost:8000${trip.cover_image}`} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl bg-gradient-to-br from-slate-100 to-slate-200">
                      ✈️
                    </div>
                  )}
                  {/* Status Badges Overlay */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm">
                      {trip.destination_count} Stops
                    </span>
                    {trip.is_public && (
                      <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm">
                        Public
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-2xl font-extrabold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{trip.title}</h2>
                  
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed flex-grow font-medium">
                    {trip.description || 'No description provided.'}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Dates</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'TBD'} - 
                        {trip.end_date ? new Date(trip.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Budget</p>
                      <p className="text-sm font-bold text-green-600">
                        {trip.budget_limit ? `$${trip.budget_limit.toLocaleString()}` : 'Flexible'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons Section */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 justify-between">
                  <button onClick={() => handleView(trip.id)} className="flex-1 bg-white border border-slate-200 text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm text-sm">View</button>
                  <button onClick={() => handleShare(trip.id)} className="flex-1 bg-white border border-slate-200 text-purple-600 font-bold py-2 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all shadow-sm text-sm">Share</button>
                  <button onClick={() => navigate(`/trips/${trip.id}/budget`)} className="flex-1 bg-white border border-slate-200 text-green-600 font-bold py-2 rounded-lg hover:bg-green-50 hover:border-green-200 transition-all shadow-sm text-sm">Cost</button>
                  
                  <div className="w-full flex gap-2 mt-1">
                    <button onClick={() => navigate(`/trips/${trip.id}/packing`)} className="flex-1 bg-white border border-slate-200 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm text-sm">Pack</button>
                    <button onClick={() => navigate(`/trips/${trip.id}/notes`)} className="flex-1 bg-white border border-slate-200 text-amber-600 font-bold py-2 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm text-sm">Notes</button>
                    <button onClick={() => handleDelete(trip.id)} className="flex-none bg-white border border-slate-200 text-red-500 font-bold py-2 px-4 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm text-sm">Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
