import React, { useState } from 'react';
import {
  Bell,
  User,
  LogIn,
  UserPlus,
  Home,
  Plus,
  Menu,
  X,
} from 'lucide-react';

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onPageChange('home')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              StackIt
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => onPageChange('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 'home'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </button>

            {user && (
              <button
                onClick={() => onPageChange('ask')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'ask'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900'
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
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-gray-500 text-center">No notifications</p>
                        ) : (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => onNotificationClick(notification)}
                            >
                              <p className="text-sm text-gray-800">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.questionTitle}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.username}</span>
                  <button
                    onClick={() => onAuthAction('logout')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAuthAction('login')}
                  className="text-sm text-gray-700 hover:text-gray-900 flex items-center"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </button>
                <button
                  onClick={() => onAuthAction('register')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  onPageChange('home');
                  setShowMobileMenu(false);
                }}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Home
              </button>
              {user && (
                <button
                  onClick={() => {
                    onPageChange('ask');
                    setShowMobileMenu(false);
                  }}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
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
