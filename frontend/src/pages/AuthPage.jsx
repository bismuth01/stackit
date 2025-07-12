import React, { useState } from 'react';

const AuthPage = ({ mode, onAuth, onToggleMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (mode === 'register' && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAuth(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#201d30] text-[#b3a8c9] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#2a243d] p-8 rounded-lg shadow-md border border-[#3d3656]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-[#1e1a2e] text-[#b3a8c9] border ${
                errors.username ? 'border-red-500' : 'border-[#5c4f6e]'
              } focus:outline-none focus:ring-2 focus:ring-[#5c4f6e]`}
            />
            {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
          </div>

          {/* Email */}
          {mode === 'register' && (
            <div>
              <label htmlFor="email" className="block text-sm mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-[#1e1a2e] text-[#b3a8c9] border ${
                  errors.email ? 'border-red-500' : 'border-[#5c4f6e]'
                } focus:outline-none focus:ring-2 focus:ring-[#5c4f6e]`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-[#1e1a2e] text-[#b3a8c9] border ${
                errors.password ? 'border-red-500' : 'border-[#5c4f6e]'
              } focus:outline-none focus:ring-2 focus:ring-[#5c4f6e]`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-[#1e1a2e] text-[#b3a8c9] border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-[#5c4f6e]'
                } focus:outline-none focus:ring-2 focus:ring-[#5c4f6e]`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#5c4f6e] text-white py-2 rounded-lg hover:bg-[#6e5c8f] transition-all"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={onToggleMode}
            className="text-[#b3a8c9] hover:text-white underline"
          >
            {mode === 'login'
              ? "Don't have an account? Register here"
              : 'Already have an account? Login here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
