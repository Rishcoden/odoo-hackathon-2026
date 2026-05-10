import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CreateTrip() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Using FormData to support file upload
    const formData = new FormData();
    formData.append('title', title);
    if (description) formData.append('description', description);
    
    // Format dates to ISO strings if provided, backend expects datetime but accepts YYYY-MM-DD as it parses it
    if (startDate) formData.append('start_date', startDate + "T00:00:00Z");
    if (endDate) formData.append('end_date', endDate + "T00:00:00Z");
    if (budgetLimit) formData.append('budget_limit', budgetLimit);
    if (coverImage) formData.append('cover_image', coverImage);

    try {
      await api.post('/trips', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.detail) {
        let msg = err.response.data.detail;
        if (Array.isArray(msg)) msg = msg.map(m => m.msg).join(', ');
        setError(msg);
      } else {
        setError('Failed to create trip');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 flex justify-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md h-fit">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create New Trip</h1>
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-800 font-medium">
            Cancel
          </button>
        </div>

        {error && <div className="mb-4 text-red-500 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title *</label>
            <input 
              type="text" required 
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={title} onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Summer in Paris"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows="3"
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What's the plan?"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                value={startDate} onChange={e => setStartDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                value={endDate} onChange={e => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit ($)</label>
            <input 
              type="number" min="0" step="0.01"
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} 
              placeholder="e.g. 1500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image (Optional)</label>
            <input 
              type="file" accept="image/*"
              className="w-full px-3 py-2 border rounded-md focus:outline-none"
              onChange={e => setCoverImage(e.target.files[0])} 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-md hover:bg-indigo-700 transition shadow-sm mt-4"
          >
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}
