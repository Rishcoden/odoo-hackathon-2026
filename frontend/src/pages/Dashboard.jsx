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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
        <div className="text-indigo-400 font-medium tracking-widest uppercase">Loading Workspace</div>
      </div>
    </div>
  );

  if (!overview) return <div className="p-10 text-center text-red-500 font-medium">Failed to load dashboard data.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 text-white pt-16 pb-24 px-6 md:px-12 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase mb-2">Workspace</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Welcome back, {overview.user_name}!</h1>
            <p className="text-indigo-200 text-lg max-w-xl">Your personal travel command center. Review your upcoming itineraries and explore new recommendations.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Navigation buttons moved to global Navbar */}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-12 relative z-20 space-y-8">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ✈️
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Trips</p>
              <p className="text-3xl font-extrabold text-slate-800">{overview.total_trips}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📅
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-extrabold text-slate-800">{overview.upcoming_trips}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              💰
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Budget</p>
              <p className="text-3xl font-extrabold text-slate-800">${overview.total_budget.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          
          {/* Recent Trips */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recent Trips</h2>
              <button onClick={() => navigate('/my-trips')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">View All &rarr;</button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {recentTrips.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <div className="text-4xl mb-3">🧳</div>
                  <p className="font-medium text-slate-600">No trips planned yet.</p>
                  <p className="text-sm mt-1">Your next adventure awaits.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentTrips.map((trip) => (
                    <li key={trip.trip_id} 
                        className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center group"
                        onClick={() => navigate(`/trips/${trip.trip_id}/itinerary`)}>
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-lg">{trip.title}</h4>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-sm font-bold rounded-lg border border-green-100">
                          {trip.budget_limit ? `$${trip.budget_limit.toLocaleString()}` : 'Flexible'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            <div className="px-1">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">AI Recommendations</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">
                        📍
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{rec.city_name}, {rec.country}</h4>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Est. Budget: <span className="text-slate-700">${rec.estimated_budget.toLocaleString()}</span></p>
                      </div>
                    </div>
                    <button className="bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-bold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-sm">
                      Explore
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
