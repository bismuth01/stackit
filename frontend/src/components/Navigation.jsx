import React, { useState } from 'react';
import {
  Bell, User, LogIn, UserPlus, Home, Plus, Menu, X,
} from 'lucide-react';
import DecryptedText from './DecryptedText'; // ✅ adjust path if needed

const Navigation = ({
  user,
  notifications,
  onNotificationClick,
  onAuthAction,
  currentPage,
  onPageChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-[#1e1a2e] border-b border-[#5c4f6e] sticky top-0 z-50 text-primary font-futuristic">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={() => onPageChange('home')}>
             <DecryptedText
                text="StackIt"
                className="text-2xl font-bold font-futuristic text-primary hover:text-white"
                speed={35}
                  animateOn="view"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => onPageChange('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                currentPage === 'home'
                  ? 'bg-[#5c4f6e] text-white'
                  : 'text-primary hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </button>

            {user && (
              <button
                onClick={() => onPageChange('ask')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentPage === 'ask'
                    ? 'bg-[#5c4f6e] text-white'
                    : 'text-primary hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Ask Question
              </button>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-primary hover:text-white"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#2b273e] border border-[#5c4f6e] rounded-lg shadow-lg z-10">
                      <div className="p-4 border-b border-[#5c4f6e]">
                        <h3 className="font-semibold text-primary">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-gray-400 text-center">No notifications</p>
                        ) : (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-[#3e385a] hover:bg-[#3e385a] cursor-pointer ${
                                !notification.read ? 'bg-[#453a67]' : ''
                              }`}
                              onClick={() => onNotificationClick(notification)}
                            >
                              <p className="text-sm text-primary">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.questionTitle}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-2 text-primary">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.username}</span>
                  <button
                    onClick={() => onAuthAction('logout')}
                    className="text-sm hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAuthAction('login')}
                  className="text-sm text-primary hover:text-white flex items-center"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </button>
                <button
                  onClick={() => onAuthAction('register')}
                  className="bg-[#5c4f6e] text-white px-4 py-2 rounded-md text-sm hover:bg-[#6a5d80] flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-primary hover:text-white"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-[#5c4f6e] bg-[#1e1a2e]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  onPageChange('home');
                  setShowMobileMenu(false);
                }}
                className="block px-3 py-2 text-base font-medium text-primary hover:text-white"
              >
                Home
              </button>
              {user && (
                <button
                  onClick={() => {
                    onPageChange('ask');
                    setShowMobileMenu(false);
                  }}
                  className="block px-3 py-2 text-base font-medium text-primary hover:text-white"
                >
                  Ask Question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
