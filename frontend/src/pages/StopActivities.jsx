import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StopActivities() {
  const { tripId, stopId } = useParams();
  const navigate = useNavigate();

  const [assignedActivities, setAssignedActivities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [cityId, setCityId] = useState(null);
  const [stopDetails, setStopDetails] = useState(null);

  // New activity form
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cost, setCost] = useState('');
  const [duration, setDuration] = useState('');

  const fetchStopAndActivities = async () => {
    try {
      setLoading(true);
      // Fetch stops to find our current stop details and city_id
      const stopsRes = await api.get(`/trips/${tripId}/stops`);
      const currentStop = stopsRes.data.find(s => s.id === stopId);
      
      if (!currentStop) {
        setError('Stop not found in this itinerary.');
        return;
      }
      
      setStopDetails(currentStop);
      setCityId(currentStop.city_id);

      // Fetch assigned activities
      const assignedRes = await api.get(`/stops/${stopId}/activities`);
      setAssignedActivities(assignedRes.data);

      // Fetch available activities in the city
      const availableRes = await api.get(`/cities/${currentStop.city_id}/activities`);
      setAvailableActivities(availableRes.data);
      
    } catch (err) {
      setError('Failed to load activity details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStopAndActivities();
  }, [tripId, stopId]);

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cities/${cityId}/activities`, {
        title,
        description: desc,
        estimated_cost: parseFloat(cost) || 0,
        duration_hours: parseFloat(duration) || 1
      });
      setTitle(''); setDesc(''); setCost(''); setDuration('');
      fetchStopAndActivities();
    } catch (err) {
      alert('Failed to create new activity');
    }
  };

  const handleAssign = async (activityId) => {
    try {
      await api.post(`/stops/${stopId}/activities`, {
        activity_id: activityId,
        scheduled_time: null // Placeholder
      });
      fetchStopAndActivities();
    } catch (err) {
      alert('Failed to assign activity');
    }
  };

  const handleRemoveAssigned = async (assignmentId) => {
    try {
      await api.delete(`/trip-activities/${assignmentId}`);
      fetchStopAndActivities();
    } catch (err) {
      alert('Failed to remove activity');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading activities...</div>;
  if (!stopDetails) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Activities: {stopDetails.city_name}</h1>
            <p className="text-gray-500 mt-1">
              Stop Schedule: {new Date(stopDetails.arrival_date).toLocaleDateString()} to {new Date(stopDetails.departure_date).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={() => navigate(`/trips/${tripId}/itinerary`)}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Back to Itinerary
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Assigned Activities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-indigo-700 mb-4">Assigned to Itinerary</h2>
            {assignedActivities.length === 0 ? (
              <p className="text-gray-500 italic">No activities planned yet.</p>
            ) : (
              <div className="space-y-4">
                {assignedActivities.map((assignment) => (
                  <div key={assignment.id} className="p-4 border rounded-lg bg-indigo-50 border-indigo-100 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{assignment.activity?.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{assignment.activity?.description}</p>
                      <div className="flex gap-4 mt-2 text-xs font-medium text-gray-500">
                        <span>Est. Cost: ${assignment.activity?.estimated_cost.toFixed(2)}</span>
                        <span>Duration: {assignment.activity?.duration_hours}h</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveAssigned(assignment.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Activities & Creation */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Available in {stopDetails.city_name}</h2>
              {availableActivities.length === 0 ? (
                <p className="text-gray-500 italic mb-4">No public activities found for this city.</p>
              ) : (
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {availableActivities.map((act) => (
                    <div key={act.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800">{act.title}</h3>
                        <p className="text-sm text-gray-500">${act.estimated_cost} • {act.duration_hours}h</p>
                      </div>
                      <button 
                        onClick={() => handleAssign(act.id)}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 text-sm font-medium"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hidden Utility: Create Activity */}
            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Utility: Add New Activity to City</h3>
              <form onSubmit={handleCreateActivity} className="space-y-3">
                <input 
                  type="text" placeholder="Title" required 
                  className="w-full px-3 py-2 border rounded focus:outline-none"
                  value={title} onChange={e => setTitle(e.target.value)}
                />
                <input 
                  type="text" placeholder="Description" 
                  className="w-full px-3 py-2 border rounded focus:outline-none"
                  value={desc} onChange={e => setDesc(e.target.value)}
                />
                <div className="flex gap-3">
                  <input 
                    type="number" placeholder="Cost ($)" min="0"
                    className="w-1/2 px-3 py-2 border rounded focus:outline-none"
                    value={cost} onChange={e => setCost(e.target.value)}
                  />
                  <input 
                    type="number" placeholder="Duration (h)" min="0.5" step="0.5"
                    className="w-1/2 px-3 py-2 border rounded focus:outline-none"
                    value={duration} onChange={e => setDuration(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition text-sm">
                  Save to City Database
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
