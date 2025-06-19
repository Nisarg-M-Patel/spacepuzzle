
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { Button } from './ui/button';

interface GameRoom {
  id: string;
  room_code: string;
  image_url: string;
  image_title: string;
  winner_id: string | null;
}

interface Player {
  id: string;
  player_id: string;
  player_name: string;
  is_host: boolean;
  moves_count: number;
  completed_at: string | null;
}

interface GameResultsProps {
  room: GameRoom;
  players: Player[];
  currentPlayerId: string;
}

const GameResults = ({ room, players, currentPlayerId }: GameResultsProps) => {
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [winner, setWinner] = useState<Player | null>(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Find the winner
    const winnerPlayer = players.find(p => p.player_id === room.winner_id) || 
                         players.find(p => p.completed_at !== null);
    setWinner(winnerPlayer || null);
    
    // Check if current user is host
    const currentPlayer = players.find(p => p.player_id === currentPlayerId);
    setIsHost(currentPlayer?.is_host || false);
  }, [players, room.winner_id, currentPlayerId]);

  const handlePlayAgain = async () => {
    if (!isHost || !room) return;

    try {
      // Fetch a new image from NASA APOD API
      const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
      const data = await response.json();

      if (!data.url) {
        throw new Error('Failed to fetch image from NASA API');
      }

      // Generate a new room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create a new room
      const { data: newRoomData, error } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCode,
          image_url: data.url,
          image_title: data.title || '',
          image_explanation: data.explanation || '',
          status: 'waiting'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add all current players to the new room
      const playerPromises = players.map(player => 
        supabase
          .from('game_players')
          .insert({
            room_id: newRoomData.id,
            player_id: player.player_id,
            player_name: player.player_name,
            is_host: player.is_host
          })
      );

      await Promise.all(playerPromises);

      // Navigate to the new room
      navigate(`/room/${newRoomData.id}`);
    } catch (error: any) {
      console.error('Failed to create new game:', error);
    }
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  // Sort players by completion status and time
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.completed_at && !b.completed_at) return -1;
    if (!a.completed_at && b.completed_at) return 1;
    if (a.completed_at && b.completed_at) {
      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    }
    return 0;
  });

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Game Results</h2>
      
      <div className="mb-8 text-center">
        <img 
          src={room.image_url} 
          alt={room.image_title || 'Space Image'} 
          className="max-h-64 mx-auto rounded-lg shadow-lg mb-4"
        />
        <h3 className="text-xl font-semibold">{room.image_title}</h3>
      </div>
      
      {winner && (
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-4 rounded-lg mb-8 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-2xl font-bold mb-1">
            {winner.player_id === currentPlayerId ? 'You Win!' : 'Player ' + (sortedPlayers.findIndex(p => p.id === winner.id) + 1) + ' Wins!'}
          </h3>
          <p className="text-gray-300">
            Completed in {winner.moves_count || 0} moves
          </p>
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-md bg-gray-700 bg-opacity-40 ${
                player.player_id === currentPlayerId ? 'border border-blue-500' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center mr-3 font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">
                    {player.player_id === currentPlayerId ? 'You' : `Player ${index + 1}`}
                  </div>
                  {player.completed_at ? (
                    <div className="text-sm text-gray-300">
                      {player.moves_count || 0} moves
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Did not complete
                    </div>
                  )}
                </div>
              </div>
              
              {index === 0 && player.completed_at && (
                <div className="text-2xl">🥇</div>
              )}
              {index === 1 && player.completed_at && (
                <div className="text-2xl">🥈</div>
              )}
              {index === 2 && player.completed_at && (
                <div className="text-2xl">🥉</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {isHost && (
          <Button 
            onClick={handlePlayAgain}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Play Again with Same Players
          </Button>
        )}
        <Button 
          onClick={handleReturnHome}
          variant="outline"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default GameResults;