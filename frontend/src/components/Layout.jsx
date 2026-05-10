import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow w-full relative">
        {children}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Traveloop AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
