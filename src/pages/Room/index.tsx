
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import Puzzle from '../../components/Puzzle';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { 
    players, 
    playerName, 
    nasaImage, 
    isLoading, 
    error, 
    fetchNasaImage, 
    setPlayerReady,
    leaveRoom
  } = useGame();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Check if all players are ready
  const allPlayersReady = players.length > 0 && players.every(player => player.isReady);
  
  // Current player's ready status
  const isPlayerReady = players.find(player => player.name === playerName)?.isReady || false;

  useEffect(() => {
    // If no room ID is provided, redirect to home
    if (!roomId) {
      navigate('/');
      return;
    }
    
    // Fetch NASA image when component mounts
    if (!nasaImage) {
      fetchNasaImage();
    }
    
    // Cleanup function
    return () => {
      if (gameStarted) {
        leaveRoom();
      }
    };
  }, [roomId, navigate, fetchNasaImage, nasaImage, gameStarted, leaveRoom]);

  useEffect(() => {
    // Start countdown when all players are ready
    if (allPlayersReady && !gameStarted && !countdown) {
      setCountdown(3);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            setGameStarted(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [allPlayersReady, gameStarted, countdown]);

  const handleReady = () => {
    setPlayerReady(!isPlayerReady);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  // Get winners (players who have completed the puzzle)
  const winners = players
    .filter(player => player.isComplete)
    .sort((a, b) => (a.completionTime || 0) - (b.completionTime || 0));

  return (
    <div className="container">
      <div className="flex justify-center items-center flex-col">
        <h1>Space Slider Puzzle</h1>
        <div className="card mb-4 w-full">
          <h2>Room: {roomId}</h2>
          <div className="flex justify-center gap-4 mb-4">
            <button onClick={handleLeaveRoom}>Leave Room</button>
            {!gameStarted && (
              <button 
                onClick={handleReady}
                style={{ backgroundColor: isPlayerReady ? 'green' : 'var(--accent)' }}
              >
                {isPlayerReady ? 'Ready ✓' : 'Ready?'}
              </button>
            )}
          </div>
          
          <h3>Players:</h3>
          <ul>
            {players.map(player => (
              <li key={player.id}>
                {player.name} {player.isReady ? '(Ready)' : '(Not Ready)'}
                {player.isComplete && ' - Completed!'}
              </li>
            ))}
          </ul>
        </div>
        
        {countdown !== null && (
          <div className="card text-center">
            <h2>Game starting in: {countdown}</h2>
          </div>
        )}
        
        {winners.length > 0 && (
          <div className="card text-center mb-4">
            <h2>Winners</h2>
            <ol>
              {winners.map((player, index) => (
                <li key={player.id}>
                  {player.name} - {(player.completionTime || 0) / 1000} seconds
                  {index === 0 && ' 🏆'}
                </li>
              ))}
            </ol>
          </div>
        )}
        
        {isLoading && <p>Loading NASA image...</p>}
        {error && <p>Error: {error}</p>}
        
        {gameStarted && nasaImage && (
          <Puzzle image={nasaImage} />
        )}
        
        {!gameStarted && nasaImage && (
          <div className="card text-center">
            <h3>Today's NASA Image</h3>
            <h4>{nasaImage.title}</h4>
            <p><small>{nasaImage.date}</small></p>
            <img 
              src={nasaImage.url} 
              alt={nasaImage.title} 
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
            <p>{nasaImage.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;