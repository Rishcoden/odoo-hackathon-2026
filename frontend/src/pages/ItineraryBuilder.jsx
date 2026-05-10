import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ItineraryBuilder() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  const fetchTripAndStops = async () => {
    try {
      setLoading(true);
      const [tripRes, stopsRes] = await Promise.all([
        api.get(`/trips/${tripId}`),
        api.get(`/trips/${tripId}/stops`)
      ]);
      setTrip(tripRes.data);
      setStops(stopsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load itinerary details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripAndStops();
  }, [tripId, navigate]);

  const handleAddStop = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/trips/${tripId}/stops`, {
        city_name: cityName,
        country: country,
        arrival_date: new Date(arrivalDate).toISOString(),
        departure_date: new Date(departureDate).toISOString()
      });
      // Clear form
      setCityName('');
      setCountry('');
      setArrivalDate('');
      setDepartureDate('');
      // Refresh list
      fetchTripAndStops();
    } catch (err) {
      let msg = err.response?.data?.detail || 'Failed to add stop.';
      if (Array.isArray(msg)) msg = msg.map(m => m.msg).join(', ');
      setError(msg);
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Remove this stop from itinerary?')) {
      try {
        await api.delete(`/stops/${stopId}`);
        fetchTripAndStops();
      } catch (err) {
        setError('Failed to delete stop.');
      }
    }
  };

  const handleReorder = async (stopId, currentOrder, direction) => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    if (newOrder < 1 || newOrder > stops.length) return;
    
    try {
      await api.put(`/stops/${stopId}/reorder`, { new_order: newOrder });
      fetchTripAndStops();
    } catch (err) {
      setError('Failed to reorder stop.');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading itinerary...</div>;
  if (!trip) return <div className="p-10 text-center text-red-500">{error || 'Trip not found.'}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{trip.title} - Itinerary</h1>
          <p className="text-slate-500 mt-2 font-medium">
            {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'} to {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'TBD'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded border border-red-200">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Stop Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add City Stop</h2>
            <form onSubmit={handleAddStop} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={cityName} onChange={e => setCityName(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={country} onChange={e => setCountry(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                <input 
                  type="date" required 
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                <input 
                  type="date" required 
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={departureDate} onChange={e => setDepartureDate(e.target.value)} 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition"
              >
                Add Stop
              </button>
            </form>
          </div>

          {/* Stops List */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Itinerary Flow</h2>
              {stops.length === 0 ? (
                <p className="text-gray-500 italic">No stops added yet.</p>
              ) : (
                <div className="space-y-4">
                  {stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center p-4 border rounded-lg bg-gray-50">
                      
                      {/* Order Control */}
                      <div className="flex flex-col items-center mr-4">
                        <button 
                          onClick={() => handleReorder(stop.id, stop.stop_order, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-400"
                        >
                          ▲
                        </button>
                        <span className="font-bold text-gray-700 my-1">{stop.stop_order}</span>
                        <button 
                          onClick={() => handleReorder(stop.id, stop.stop_order, 'down')}
                          disabled={index === stops.length - 1}
                          className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-400"
                        >
                          ▼
                        </button>
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-indigo-700">{stop.city_name}, {stop.country}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(stop.arrival_date).toLocaleDateString()} - {new Date(stop.departure_date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => navigate(`/trips/${tripId}/stops/${stop.id}/activities`)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Activities
                        </button>
                        <button 
                          onClick={() => handleDeleteStop(stop.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
