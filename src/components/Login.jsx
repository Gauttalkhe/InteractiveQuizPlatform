import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser } from '../utils/db';
import { UserCircle, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      navigate('/quiz');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    try {
      const user = {
        id: Date.now().toString(),
        username: trimmedUsername
      };

      await saveUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/quiz');
    } catch (err) {
      setError('Failed to save user. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <UserCircle className="w-16 h-16 text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Quiz Platform</h1>
          <p className="text-gray-600 mt-2 text-center">
            Test your knowledge with our interactive quizzes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(''); // Clear error when user types
              }}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your username (min. 3 characters)"
              minLength={3}
              required
            />
            {error && (
              <div className="mt-2 flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Start Quiz
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Enter your name to begin the quiz</p>
          <p className="mt-1">Your progress will be saved automatically</p>
        </div>
      </div>
    </div>
  );
}