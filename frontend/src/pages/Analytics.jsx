import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Analytics() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [budget, setBudget] = useState(null);
  const [topCities, setTopCities] = useState(null);
  const [activities, setActivities] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewRes, budgetRes, citiesRes, activitiesRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/budget-breakdown'),
          api.get('/analytics/top-cities'),
          api.get('/analytics/activity-categories')
        ]);
        
        setOverview(overviewRes.data);
        setBudget(budgetRes.data);
        setTopCities(citiesRes.data);
        setActivities(activitiesRes.data);
      } catch (err) {
        setError('Failed to load analytics dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Compiling Analytics...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-indigo-700 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Overview</h1>
            <p className="text-indigo-200 mt-2">Global insights across all your travel data.</p>
          </div>
          <button 
            onClick={() => navigate('/my-trips')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-md transition"
          >
            Back to Trips
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 space-y-8 relative z-10">
        
        {/* Top Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Trips</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{overview.total_trips}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Destinations</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{overview.total_destinations}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Activities</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{overview.total_activities_planned}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Packing</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{overview.packing_completion_rate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Budget Breakdown */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Financial Overview</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Total Expenses</p>
                <p className="text-2xl font-bold text-red-500 mt-1">${budget.total_expenses.toFixed(0)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Avg Trip Budget</p>
                <p className="text-2xl font-bold text-green-600 mt-1">${budget.average_trip_budget.toFixed(0)}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Category Breakdown</h3>
            {Object.keys(budget.budget_category_breakdown).length === 0 ? (
              <p className="text-gray-500 italic text-sm">No expenses recorded.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(budget.budget_category_breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amt]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat}</span>
                        <span className="text-gray-900 font-bold">${amt.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min((amt / budget.total_expenses) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Cities & Activities */}
          <div className="space-y-8">
            
            {/* Top Cities */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Most Visited Cities</h2>
              {topCities.most_visited_cities.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No cities visited yet.</p>
              ) : (
                <div className="space-y-4">
                  {topCities.most_visited_cities.map((city, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{city.city_name}</p>
                          <p className="text-xs text-gray-500">{city.country}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {city.visit_count} visit{city.visit_count !== 1 && 's'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Distribution */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Activity Preferences</h2>
              {Object.keys(activities.activity_distribution).length === 0 ? (
                <p className="text-gray-500 italic text-sm">No activities planned yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(activities.activity_distribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg">
                        <span className="font-medium text-indigo-800">{cat}</span>
                        <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-bold">{count}</span>
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
