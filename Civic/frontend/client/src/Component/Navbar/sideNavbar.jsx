import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/authContext';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaClipboardList, 
  FaUsers, 
  FaBell, 
  FaCog,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';

const SideNavbar = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed z-50 top-4 left-4 md:hidden bg-black text-white p-2 rounded-md shadow-lg"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side navbar */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-300 ease-in-out z-40 flex flex-col w-64 bg-black text-white shadow-2xl`}>
        {/* Logo area */}
        <div className="flex justify-center items-center py-8 border-b border-gray-800">
          <Link to="/" className="text-3xl font-extrabold tracking-tighter">
            CIVIC
            <span className="block text-xs font-normal tracking-wide text-gray-400 mt-1">PEOPLE POWERED DEMOCRACY</span>
          </Link>
        </div>

        {/* User profile section */}
        {currentUser && (
          <div className="flex flex-col items-center py-6 border-b border-gray-800">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-2">
              {currentUser.profilePicture ? (
                <img 
                  src={currentUser.profilePicture}
                  alt={currentUser.fullName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle size={36} className="text-gray-400" />
              )}
            </div>
            <h3 className="font-medium">{currentUser.fullName}</h3>
            <p className="text-xs text-gray-400">{currentUser.role}</p>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <Link 
            to="/dashboard" 
            className={`flex items-center py-3 px-4 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-white text-black font-medium' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <FaHome className="mr-3" size={18} />
            <span className="text-sm tracking-wide">Dashboard</span>
          </Link>
          
          <Link 
            to="/campaigns" 
            className={`flex items-center py-3 px-4 rounded-lg transition-colors ${isActive('/campaigns') ? 'bg-white text-black font-medium' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <FaClipboardList className="mr-3" size={18} />
            <span className="text-sm tracking-wide">Campaigns</span>
          </Link>
          
          <Link 
            to="/community" 
            className={`flex items-center py-3 px-4 rounded-lg transition-colors ${isActive('/community') ? 'bg-white text-black font-medium' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <FaUsers className="mr-3" size={18} />
            <span className="text-sm tracking-wide">Community</span>
          </Link>
          
          {currentUser && (
            <>
              <div className="pt-6 pb-2 px-4 border-t border-gray-800">
                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">User</h4>
              </div>
              
              <Link 
                to="/notifications" 
                className={`flex items-center py-3 px-4 rounded-lg transition-colors ${isActive('/notifications') ? 'bg-white text-black font-medium' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <FaBell className="mr-3" size={18} />
                <span className="text-sm tracking-wide">Notifications</span>
              </Link>
              
              <Link 
                to="/settings" 
                className={`flex items-center py-3 px-4 rounded-lg transition-colors ${isActive('/settings') ? 'bg-white text-black font-medium' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <FaCog className="mr-3" size={18} />
                <span className="text-sm tracking-wide">Settings</span>
              </Link>
              
              <button 
                onClick={logout}
                className="w-full flex items-center py-3 px-4 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <FaSignOutAlt className="mr-3" size={18} />
                <span className="text-sm tracking-wide">Sign Out</span>
              </button>
            </>
          )}
          
          {!currentUser && (
            <div className="space-y-2 mt-6 px-4">
              <Link 
                to="/" 
                className="block w-full py-2 text-center border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="block w-full py-2 text-center bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
        
        {/* Footer */}
        <div className="py-4 px-6 border-t border-gray-800 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Civic Platform</p>
        </div>
      </div>
    </>
  );
};

export default SideNavbar;