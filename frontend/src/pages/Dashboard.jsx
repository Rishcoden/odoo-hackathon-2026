import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, tripsRes, recsRes] = await Promise.all([
          api.get('/dashboard/overview'),
          api.get('/dashboard/recent-trips'),
          api.get('/dashboard/recommendations')
        ]);
        setOverview(overviewRes.data);
        setRecentTrips(tripsRes.data);
        setRecommendations(recsRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  if (!overview) return <div className="p-8 text-center text-red-500">Failed to load dashboard.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {overview.user_name}! 👋</h1>
            <p className="text-gray-500 mt-1">Here is the overview of your travel plans.</p>
          </div>
          <div className="space-x-3">
            <button 
              onClick={() => navigate('/create-trip')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Create Trip
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="bg-red-500 text-white px-5 py-2 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Trips</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{overview.total_trips}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Upcoming Trips</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{overview.upcoming_trips}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Budget (Est.)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">${overview.total_budget.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Trips List */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Trips</h2>
            {recentTrips.length === 0 ? (
              <p className="text-gray-500 italic">No trips planned yet.</p>
            ) : (
              <ul className="space-y-4">
                {recentTrips.map(trip => (
                  <li key={trip.trip_id} className="p-4 border rounded hover:bg-gray-50 transition">
                    <h4 className="font-semibold text-indigo-600">{trip.title}</h4>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'}</span>
                      <span>{trip.budget_limit ? `$${trip.budget_limit}` : 'No limit'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommendations List */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended for You</h2>
            <ul className="space-y-4">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="p-4 border rounded hover:bg-gray-50 transition flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{rec.city_name}, {rec.country}</h4>
                    <p className="text-sm text-gray-500 mt-1">Est. ${rec.estimated_budget}</p>
                  </div>
                  <button className="text-indigo-600 text-sm font-medium hover:underline">Explore</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
