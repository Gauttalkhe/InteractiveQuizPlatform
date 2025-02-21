import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { Timer, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';
import { saveAttempt } from '../utils/db';

export default function Quiz() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/');
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleAnswer = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: answer,
    }));
  };

  const handleNextQuestion = async () => {
    if (currentQuestion === questions.length - 1) {
      const endTime = new Date();
      const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      
      let score = 0;
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question && answer === question.correctAnswer) {
          score++;
        }
      });

      const attempt = {
        id: Date.now().toString(),
        userId: currentUser.id,
        date: new Date(),
        score,
        timeSpent,
        answers,
      };

      await saveAttempt(attempt);
      navigate('/results', { state: { attempt } });
    } else {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(30);
    }
  };

  const question = questions[currentQuestion];

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="text-lg font-medium text-gray-700">Welcome, {currentUser.username}!</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-red-600 hover:text-red-700"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <div className="flex items-center text-blue-600">
              <Timer className="w-5 h-5 mr-2" />
              <span className="font-medium">{timeLeft}s</span>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-lg text-gray-700 mb-6">{question.text}</p>

            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(String.fromCharCode(65 + index))}
                    className={`w-full text-left p-4 rounded-lg border ${
                      answers[question.id] === String.fromCharCode(65 + index)
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'integer' && (
              <input
                type="number"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your answer"
              />
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}