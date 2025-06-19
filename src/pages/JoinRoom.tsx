
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSupabase } from '../contexts/SupabaseContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const JoinRoom = () => {
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode) {
      toast.error('Please enter a room code');
      return;
    }

    setIsJoining(true);

    try {
      // Find the room with the given code
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (roomError) {
        throw new Error('Room not found. Please check the code and try again.');
      }

      if (roomData.status === 'completed') {
        throw new Error('This game has already ended.');
      }

      // Generate a random player ID
      const playerId = crypto.randomUUID();
      localStorage.setItem('spaceSliderPlayerId', playerId);

      // Add player to the room
      const { error: joinError } = await supabase
        .from('game_players')
        .insert({
          room_id: roomData.id,
          player_id: playerId,
          player_name: `Player ${Math.floor(Math.random() * 1000)}`,
          is_host: false
        });

      if (joinError) {
        throw joinError;
      }

      // Navigate to the game room
      navigate(`/room/${roomData.id}`);
      toast.success('Joined room successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
      <Button 
        onClick={() => navigate('/')}
        variant="ghost"
        className="absolute top-4 left-4"
      >
        ← Back to Home
      </Button>

      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Join a Room</h1>
        
        <form onSubmit={handleJoinRoom} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="bg-gray-700 text-center text-xl tracking-wider uppercase"
              maxLength={6}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isJoining || !roomCode}
          >
            {isJoining ? (
              <>
                <span className="mr-2">Joining</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              'Join Room'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Ask your friend for the 6-digit room code.</p>
          <p className="mt-2">Want to create your own room instead?</p>
          <Button 
            onClick={() => navigate('/')}
            variant="link"
            className="text-blue-400 hover:text-blue-300"
          >
            Create a Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;