import React, { useState, useEffect } from 'react';
import { AlertCircle, Trophy, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FantasyF1Game = () => {
  const [predictions, setPredictions] = useState([]);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    // Fetch player score and past predictions
    // This would be an API call in a real application
    setPlayerScore(1000);
    setPredictions([
      { id: 1, type: 'Overtake', prediction: true, result: true },
      { id: 2, type: 'Pit Stop', prediction: false, result: false },
    ]);
  }, []);

  const handlePrediction = (predictionValue) => {
    // In a real application, this would send the prediction to the backend
    setCurrentPrediction(predictionValue);
    setShowAlert(true);
    setAlertMessage(`You predicted ${predictionValue ? 'an overtake' : 'no overtake'}!`);
    
    // Hide the alert after 3 seconds
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fantasy F1</h1>
        <div className="flex items-center">
          <User className="mr-2" />
          <span>Score: {playerScore}</span>
        </div>
      </header>

      <main className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="bg-gray-200 aspect-video mb-4">
            {/* Placeholder for video stream */}
            <img src="/api/placeholder/640/360" alt="F1 Race Stream" className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handlePrediction(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Predict Overtake
            </button>
            <button
              onClick={() => handlePrediction(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Predict No Overtake
            </button>
          </div>
          {showAlert && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Prediction Submitted</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Predictions</h2>
          <ul className="space-y-2">
            {predictions.map((pred) => (
              <li key={pred.id} className="flex items-center">
                <Trophy className={`mr-2 ${pred.prediction === pred.result ? 'text-green-500' : 'text-red-500'}`} />
                <span>{pred.type}: {pred.prediction ? 'Yes' : 'No'}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default FantasyF1Game;