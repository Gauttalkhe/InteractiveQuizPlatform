import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { getUserAttempts } from '../utils/db';
import { Award, Clock, History, LogOut, RefreshCw } from 'lucide-react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const currentAttempt = location.state?.attempt;

  useEffect(() => {
    if (!currentAttempt) {
      navigate('/');
      return;
    }

    const loadAttempts = async () => {
      const userAttempts = await getUserAttempts(currentAttempt.userId);
      setAttempts(userAttempts.sort((a, b) => b.date.getTime() - a.date.getTime()));
    };

    loadAttempts();
  }, [currentAttempt, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/quiz');
  };

  if (!currentAttempt) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Quiz Results</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Exit Quiz
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg flex items-center">
              <Award className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-gray-800">
                  {currentAttempt.score} / {questions.length}
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg flex items-center">
              <Clock className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-gray-800">
                  {currentAttempt.timeSpent}s
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg flex items-center">
              <History className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Attempt</p>
                <p className="text-2xl font-bold text-gray-800">
                  #{attempts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question) => {
              const userAnswer = currentAttempt.answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div
                  key={question.id}
                  className={`p-6 rounded-lg ${
                    isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p className="font-medium text-gray-800 mb-2">
                    {question.id}. {question.text}
                  </p>
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Your answer:</span>{' '}
                      {userAnswer}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Correct answer:</span>{' '}
                      {question.correctAnswer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleTryAgain}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>

        {attempts.length > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Previous Attempts</h2>
            <div className="space-y-4">
              {attempts.slice(1).map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      Score: {attempt.score} / {questions.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(attempt.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-600">Time: {attempt.timeSpent}s</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}