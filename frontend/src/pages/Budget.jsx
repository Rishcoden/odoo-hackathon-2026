import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Budget() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, expRes] = await Promise.all([
        api.get(`/trips/${tripId}/budget-summary`),
        api.get(`/trips/${tripId}/expenses`)
      ]);
      setSummary(sumRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      setError('Failed to load budget data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${tripId}/expenses`, {
        title,
        category,
        amount: parseFloat(amount),
        notes
      });
      setTitle(''); setCategory(''); setAmount(''); setNotes('');
      fetchData();
    } catch (err) {
      alert('Failed to add expense.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete expense.');
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading budget data...</div>;
  if (!summary) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Trip Budget & Expenses</h1>
            <p className="text-gray-500 mt-1">Aggregated financial overview for your trip.</p>
          </div>
          <button 
            onClick={() => navigate('/my-trips')}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Back to Trips
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Est. Budget</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">${summary.total_estimated_budget.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Activity Costs</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">${summary.total_activity_cost.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Manual Expenses</h3>
            <p className="text-3xl font-bold text-red-500 mt-2">${summary.total_manual_expenses.toFixed(2)}</p>
          </div>
          <div className={`p-6 rounded-lg shadow-sm border ${summary.remaining_budget >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className={`text-sm font-medium uppercase tracking-wide ${summary.remaining_budget >= 0 ? 'text-green-700' : 'text-red-700'}`}>Remaining</h3>
            <p className={`text-3xl font-bold mt-2 ${summary.remaining_budget >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              ${summary.remaining_budget.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Category Breakdown */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown</h2>
              {Object.keys(summary.category_breakdown).length === 0 ? (
                <p className="text-gray-500 italic">No expenses yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(summary.category_breakdown).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="text-gray-900 font-bold">${amt.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Expense Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Add Manual Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <input 
                  type="text" placeholder="Title (e.g. Flight to Paris)" required 
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={title} onChange={e => setTitle(e.target.value)}
                />
                <input 
                  type="text" placeholder="Category (e.g. Flights)" required 
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={category} onChange={e => setCategory(e.target.value)}
                />
                <input 
                  type="number" placeholder="Amount ($)" min="0" step="0.01" required 
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={amount} onChange={e => setAmount(e.target.value)}
                />
                <input 
                  type="text" placeholder="Notes (Optional)" 
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={notes} onChange={e => setNotes(e.target.value)}
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-medium">
                  Add Expense
                </button>
              </form>
            </div>
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Manual Expense Log</h2>
            {expenses.length === 0 ? (
              <p className="text-gray-500 italic">No manual expenses recorded.</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div key={exp.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{exp.title}</h3>
                      <div className="flex gap-3 text-sm text-gray-500 mt-1">
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-medium text-gray-700">{exp.category}</span>
                        <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                      </div>
                      {exp.notes && <p className="text-sm text-gray-600 mt-2">{exp.notes}</p>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-red-500">-${exp.amount.toFixed(2)}</div>
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-red-400 hover:text-red-700 text-sm font-medium mt-2"
                      >
                        Delete
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
  );
}
