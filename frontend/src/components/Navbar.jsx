import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Trips', path: '/my-trips' },
    { name: 'Analytics', path: '/analytics' }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo & Desktop Links */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-sm">
                ✈️
              </div>
              <span className="text-xl font-black tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors">
                Traveloop<span className="text-indigo-600">AI</span>
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/create-trip"
              className="hidden md:inline-flex bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 hover:shadow transition-all active:scale-95"
            >
              + New Trip
            </Link>
            
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 text-sm font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile nav items (simple scrollable row) */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50 overflow-x-auto">
        <div className="flex px-4 py-2 gap-2 min-w-max">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                    : 'bg-white text-slate-600 border border-slate-200 shadow-sm'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <Link 
            to="/create-trip"
            className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-indigo-600 text-white shadow-sm"
          >
            + New Trip
          </Link>
        </div>
      </div>
    </nav>
  );
}
