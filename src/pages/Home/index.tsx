
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const { createRoom, joinRoom } = useGame();
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const newRoomId = createRoom(playerName);
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!roomIdInput.trim()) {
      alert('Please enter a room ID');
      return;
    }
    
    joinRoom(roomIdInput, playerName);
    navigate(`/room/${roomIdInput}`);
  };

  return (
    <div className="container flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className="text-center">Space Slider Puzzle</h1>
        <p className="text-center mb-4">
          Compete with friends to solve NASA space image puzzles!
        </p>
        
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full"
          />
          
          {!showJoinForm ? (
            <>
              <button onClick={handleCreateRoom} className="w-full">
                Create New Room
              </button>
              <button 
                onClick={() => setShowJoinForm(true)} 
                className="w-full"
                style={{ backgroundColor: 'var(--secondary)' }}
              >
                Join Existing Room
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="w-full"
              />
              <button onClick={handleJoinRoom} className="w-full">
                Join Room
              </button>
              <button 
                onClick={() => setShowJoinForm(false)} 
                className="w-full"
                style={{ backgroundColor: 'var(--secondary)' }}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;