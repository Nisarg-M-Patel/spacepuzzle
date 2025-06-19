
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSupabase } from '../contexts/SupabaseContext';
import { Button } from '../components/ui/button';

const Home = () => {
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);

    try {
      // Fetch image from NASA APOD API
      const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
      const data = await response.json();

      if (!data.url) {
        throw new Error('Failed to fetch image from NASA API');
      }

      // Generate a random 6-character room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create a new room in the database
      const { data: roomData, error } = await supabase
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

      // Generate a random player ID
      const playerId = crypto.randomUUID();
      localStorage.setItem('spaceSliderPlayerId', playerId);

      // Add the creator as a player and host
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          room_id: roomData.id,
          player_id: playerId,
          player_name: `Player ${Math.floor(Math.random() * 1000)}`,
          is_host: true
        });

      if (playerError) {
        throw playerError;
      }

      // Navigate to the game room
      navigate(`/room/${roomData.id}`);
      toast.success(`Room created! Code: ${roomCode}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create room');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = () => {
    navigate('/join');
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Space Puzzle Challenge
      </h1>
      <p className="text-xl text-center mb-12 max-w-2xl text-gray-300">
        Compete with friends to solve sliding puzzles featuring NASA's Astronomy Picture of the Day!
      </p>

      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
        <div className="grid grid-cols-1 gap-4">
          <Button 
            onClick={handleCreateRoom} 
            disabled={isCreatingRoom}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreatingRoom ? (
              <>
                <span className="mr-2">Creating Room</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              'Create New Room'
            )}
          </Button>
          <Button 
            onClick={handleJoinRoom}
            variant="outline"
          >
            Join Room
          </Button>
        </div>
      </div>

      <div className="text-center max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>
        <ol className="text-left space-y-2 text-gray-300">
          <li>1. Create a new game room or join an existing one with a code</li>
          <li>2. Share the room code with friends</li>
          <li>3. The host starts the game when everyone is ready</li>
          <li>4. Solve the sliding puzzle faster than your opponents</li>
          <li>5. The first player to complete the puzzle wins!</li>
        </ol>
      </div>
    </div>
  );
};

export default Home;