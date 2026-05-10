import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TripNotes() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [tripStopId, setTripStopId] = useState('');

  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesRes, stopsRes] = await Promise.all([
        api.get(`/trips/${tripId}/notes`),
        api.get(`/trips/${tripId}/stops`)
      ]);
      setNotes(notesRes.data);
      setStops(stopsRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load notes data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      content: content || null,
      note_date: noteDate || null,
      trip_stop_id: tripStopId || null
    };

    try {
      if (editingId) {
        await api.put(`/notes/${editingId}`, payload);
      } else {
        await api.post(`/trips/${tripId}/notes`, payload);
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert('Failed to save note.');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete note.');
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content || '');
    setNoteDate(note.note_date || '');
    setTripStopId(note.trip_stop_id || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setNoteDate('');
    setTripStopId('');
  };

  const getStopName = (stopId) => {
    const stop = stops.find(s => s.id === stopId);
    return stop ? `${stop.city.city_name}` : 'General Trip Note';
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading journal...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Trip Journal</h1>
            <p className="text-gray-500 mt-1">Record memories, important details, and travel logs.</p>
          </div>
          <button 
            onClick={() => navigate('/my-trips')}
            className="whitespace-nowrap bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Back to Trips
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Edit Note' : 'New Note'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" required 
                    className="w-full px-3 py-2 border rounded-md"
                    value={title} onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea 
                    rows="4"
                    className="w-full px-3 py-2 border rounded-md"
                    value={content} onChange={e => setContent(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-md"
                    value={noteDate} onChange={e => setNoteDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link to Stop (Optional)</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    value={tripStopId} onChange={e => setTripStopId(e.target.value)}
                  >
                    <option value="">-- General Note --</option>
                    {stops.map(stop => (
                      <option key={stop.id} value={stop.id}>{stop.city.city_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
                    {editingId ? 'Update' : 'Save'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition hover:bg-gray-300">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Notes List */}
          <div className="md:col-span-2 space-y-6">
            {notes.length === 0 ? (
              <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500">
                <p>No journal entries yet.</p>
                <p className="text-sm mt-2">Start writing your memories on the left.</p>
              </div>
            ) : (
              notes.map(note => (
                <div key={note.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative group transition hover:shadow-md">
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition flex gap-3 bg-white pl-4">
                    <button onClick={() => handleEdit(note)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(note.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-4 pr-24">
                    <h3 className="text-xl font-bold text-gray-800">{note.title}</h3>
                    {note.note_date && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
                        {new Date(note.note_date).toLocaleDateString()}
                      </span>
                    )}
                    {note.trip_stop_id && (
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2 py-1 rounded font-medium">
                        📍 {getStopName(note.trip_stop_id)}
                      </span>
                    )}
                  </div>
                  
                  {note.content ? (
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No content.</p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-6 border-t pt-3">Added: {new Date(note.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
