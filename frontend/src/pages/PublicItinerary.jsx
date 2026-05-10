import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function PublicItinerary() {
  const { token } = useParams();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        setLoading(true);
        // Using the public read-only endpoint (No auth required)
        const response = await api.get(`/public/trips/${token}`);
        setTripData(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Public itinerary not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrip();
  }, [token]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Itinerary...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-medium">{error}</div>;

  const { overview, stops, budget_summary, packing_progress } = tripData;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="bg-indigo-700 text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase mb-4 inline-block">Public Itinerary</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{overview.title}</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            {overview.destination} • {new Date(overview.start_date).toLocaleDateString()} to {new Date(overview.end_date).toLocaleDateString()}
          </p>
          {overview.description && <p className="mt-6 text-indigo-50 max-w-2xl mx-auto italic">{overview.description}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20 space-y-8">
        
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-gray-100">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Stops</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stops.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Activities</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {stops.reduce((acc, stop) => acc + stop.activities.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Est. Cost</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">${(budget_summary.total_activity_cost + budget_summary.total_manual_expenses).toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Packed</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{packing_progress.percentage}%</p>
          </div>
        </div>

        {/* Itinerary Flow */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Itinerary Stops</h2>
          
          {stops.length === 0 ? (
            <p className="text-gray-500 italic text-center py-6">No stops have been added yet.</p>
          ) : (
            <div className="space-y-12">
              {stops.map((stop, index) => (
                <div key={stop.id} className="relative">
                  {/* Timeline connector */}
                  {index !== stops.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-[-3rem] w-0.5 bg-indigo-100 hidden sm:block"></div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                    <div className="sm:w-48 shrink-0">
                      <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-lg text-center font-medium">
                        <p className="text-sm text-indigo-500 uppercase tracking-wide mb-1">Stop {index + 1}</p>
                        <p>{new Date(stop.arrival_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-800">{stop.city_name}, {stop.country}</h3>
                      <p className="text-sm text-gray-500 mt-1">Departing: {new Date(stop.departure_date).toLocaleDateString()}</p>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Planned Activities</h4>
                        {stop.activities.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">Free time / No planned activities</p>
                        ) : (
                          <div className="space-y-3">
                            {stop.activities.map(assignment => (
                              <div key={assignment.id} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center shadow-sm">
                                <div>
                                  <p className="font-medium text-gray-800">{assignment.activity.title}</p>
                                  {assignment.notes && <p className="text-xs text-gray-500 mt-1">{assignment.notes}</p>}
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                  <span className="block">{assignment.activity.duration_hours}h</span>
                                  <span className="block font-medium text-indigo-600">${assignment.activity.estimated_cost}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Powered By Footer */}
        <div className="text-center pt-8">
          <p className="text-gray-400 text-sm">Powered by <span className="font-bold text-indigo-400">Traveloop AI</span></p>
        </div>

      </div>
    </div>
  );
}
