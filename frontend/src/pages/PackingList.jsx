import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PackingList() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trips/${tripId}/packing-items`);
      setItems(response.data);
    } catch (err) {
      setError('Failed to load packing checklist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [tripId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${tripId}/packing-items`, {
        item_name: itemName,
        category: category || null
      });
      setItemName('');
      setCategory('');
      fetchItems();
    } catch (err) {
      alert('Failed to add packing item.');
    }
  };

  const handleToggle = async (itemId, currentStatus) => {
    try {
      await api.patch(`/packing-items/${itemId}/toggle`, {
        is_packed: !currentStatus
      });
      // Optimistic update
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, is_packed: !currentStatus } : item));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/packing-items/${itemId}`);
      fetchItems();
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  const packedItems = items.filter(i => i.is_packed);
  const unpackedItems = items.filter(i => !i.is_packed);
  const progress = items.length === 0 ? 0 : Math.round((packedItems.length / items.length) * 100);

  if (loading) return <div className="p-10 text-center">Loading checklist...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold text-gray-800">Packing Checklist</h1>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{packedItems.length} of {items.length} packed ({progress}%)</p>
          </div>
          <button 
            onClick={() => navigate('/my-trips')}
            className="whitespace-nowrap bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Back to Trips
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Add Item Form */}
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input 
                type="text" placeholder="Item Name (e.g. Passport)" required 
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={itemName} onChange={e => setItemName(e.target.value)}
              />
              <input 
                type="text" placeholder="Category (e.g. Documents)" 
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={category} onChange={e => setCategory(e.target.value)}
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-medium">
                Add to List
              </button>
            </form>
          </div>

          {/* Checklist */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Unpacked Items */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">To Pack ({unpackedItems.length})</h2>
              {unpackedItems.length === 0 ? (
                <p className="text-gray-500 italic text-sm">All items packed or list is empty.</p>
              ) : (
                <div className="space-y-2">
                  {unpackedItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 group transition">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                          checked={item.is_packed}
                          onChange={() => handleToggle(item.id, item.is_packed)}
                        />
                        <div>
                          <span className="font-medium text-gray-800">{item.item_name}</span>
                          {item.category && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.category}</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Packed Items */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 opacity-75">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Packed ({packedItems.length})</h2>
              {packedItems.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No items packed yet.</p>
              ) : (
                <div className="space-y-2">
                  {packedItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                          checked={item.is_packed}
                          onChange={() => handleToggle(item.id, item.is_packed)}
                        />
                        <div>
                          <span className="font-medium text-gray-500 line-through">{item.item_name}</span>
                          {item.category && <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">{item.category}</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
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
