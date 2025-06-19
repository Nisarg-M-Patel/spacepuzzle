
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useSupabase } from '../contexts/SupabaseContext';
import { Button } from '../components/ui/button';
import SlidingPuzzle from '../components/SlidingPuzzle';
import PlayersList from '../components/PlayersList';
import GameResults from '../components/GameResults';
import { Separator } from '../components/ui/separator';

interface GameRoom {
  id: string;
  room_code: string;
  image_url: string;
  image_title: string;
  image_explanation: string;
  status: 'waiting' | 'playing' | 'completed';
  winner_id: string | null;
  created_at: string;
}

interface Player {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  is_host: boolean;
  joined_at: string;
  moves_count: number;
  completed_at: string | null;
  puzzle_state: any;
}

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { username } = useAuth();
  const supabase = useSupabase();
  
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [moves, setMoves] = useState(0);

  // Fetch room data
  const fetchRoomData = useCallback(async () => {
    if (!roomId) return;

    try {
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) {
        throw roomError;
      }

      setRoom(roomData);
      setGameStarted(roomData.status === 'playing' || roomData.status === 'completed');

      // Fetch all players in the room
      const { data: allPlayers, error: playersError } = await supabase
        .from('game_players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      if (playersError) {
        throw playersError;
      }

      setPlayers(allPlayers);
      
      // Find the current player by name
      const player = allPlayers.find(p => p.player_name === username);
      if (player) {
        setCurrentPlayer(player);
        setIsHost(player.is_host);
        setMoves(player.moves_count || 0);
      } else {
        // If player not found, redirect to join page
        navigate('/join');
        return;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load game room');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, username, supabase, navigate]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!roomId) return;

    fetchRoomData();

    // Subscribe to room changes
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`
      }, (payload) => {
        setRoom(payload.new as GameRoom);
        if (payload.new.status === 'playing' && !gameStarted) {
          setGameStarted(true);
          toast.info('Game started!');
        } else if (payload.new.status === 'completed' && gameStarted) {
          toast.success('Game completed!');
        }
      })
      .subscribe();

    // Subscribe to player changes
    const playersSubscription = supabase
      .channel(`players:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `room_id=eq.${roomId}`
      }, () => {
        // Refresh players list
        supabase
          .from('game_players')
          .select('*')
          .eq('room_id', roomId)
          .order('joined_at', { ascending: true })
          .then(({ data }) => {
            if (data) {
              setPlayers(data);
              // Update current player info if needed
              const updatedCurrentPlayer = data.find(p => p.player_name === username);
              if (updatedCurrentPlayer) {
                setCurrentPlayer(updatedCurrentPlayer);
              }
            }
          });
      })
      .subscribe();

    return () => {
      roomSubscription.unsubscribe();
      playersSubscription.unsubscribe();
    };
  }, [roomId, username, supabase, fetchRoomData, gameStarted]);

  const startGame = async () => {
    if (!isHost || !room) return;

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({ status: 'playing' })
        .eq('id', room.id);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start game');
    }
  };

  const handlePuzzleComplete = async () => {
    if (!room || !currentPlayer) return;

    try {
      // Update player's completion status
      const { error: playerUpdateError } = await supabase
        .from('game_players')
        .update({
          completed_at: new Date().toISOString(),
          moves_count: moves
        })
        .eq('id', currentPlayer.id);

      if (playerUpdateError) {
        throw playerUpdateError;
      }

      // Check if this is the first player to complete
      const { data: completedPlayers, error: countError } = await supabase
        .from('game_players')
        .select('player_id')
        .eq('room_id', room.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: true });

      if (countError) {
        throw countError;
      }

      // If this is the first player to complete, set as winner
      if (completedPlayers.length === 1 && completedPlayers[0].player_id === currentPlayer.player_id) {
        const { error: winnerError } = await supabase
          .from('game_rooms')
          .update({
            status: 'completed',
            winner_id: currentPlayer.player_id
          })
          .eq('id', room.id);

        if (winnerError) {
          throw winnerError;
        }

        toast.success('Congratulations! You won the game!');
      } else {
        toast.success('Puzzle completed!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record completion');
    }
  };

  const handleMovesMade = async (newMoves: number) => {
    setMoves(newMoves);
    
    if (!room || !currentPlayer) return;

    try {
      await supabase
        .from('game_players')
        .update({ moves_count: newMoves })
        .eq('id', currentPlayer.id);
    } catch (error) {
      console.error('Failed to update moves count:', error);
    }
  };

  const leaveRoom = async () => {
    if (!room || !currentPlayer) return;

    try {
      if (isHost && players.length > 1) {
        // Transfer host status to another player
        const nextPlayer = players.find(p => p.id !== currentPlayer.id);
        if (nextPlayer) {
          await supabase
            .from('game_players')
            .update({ is_host: true })
            .eq('id', nextPlayer.id);
        }
      }

      // Remove player from room
      await supabase
        .from('game_players')
        .delete()
        .eq('id', currentPlayer.id);

      navigate('/');
      toast.success('Left the room');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave room');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Game Room</h1>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!room || !currentPlayer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Space Puzzle Challenge</h1>
          <p className="text-gray-400">Room Code: {room.room_code}</p>
        </div>
        <Button 
          onClick={leaveRoom}
          variant="outline"
        >
          Leave Room
        </Button>
      </div>

      {room.status === 'completed' ? (
        <GameResults room={room} players={players} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {gameStarted ? (
              <div className="bg-gray-800 rounded-lg p-4 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{room.image_title || 'Space Puzzle'}</h2>
                  <div className="text-gray-300">Moves: {moves}</div>
                </div>
                {imageLoaded && (
                  <SlidingPuzzle 
                    imageUrl={room.image_url} 
                    onComplete={handlePuzzleComplete}
                    onMove={handleMovesMade}
                  />
                )}
                {!imageLoaded && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Loading image...</p>
                    <img 
                      src={room.image_url} 
                      alt="Preload" 
                      className="hidden"
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Waiting for the game to start</h2>
                {isHost ? (
                  <div className="text-center">
                    <p className="mb-4 text-gray-300">
                      You are the host. Start the game when everyone is ready.
                    </p>
                    <Button 
                      onClick={startGame}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={players.length < 1}
                    >
                      Start Game
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-300">
                    Waiting for the host to start the game...
                  </p>
                )}
                <div className="mt-8 w-full max-w-md">
                  <img 
                    src={room.image_url} 
                    alt={room.image_title || 'Space Image'} 
                    className="w-full h-auto rounded-lg shadow-lg mb-4 opacity-50"
                    onLoad={() => setImageLoaded(true)}
                  />
                  <p className="text-sm text-gray-400 italic text-center">
                    Preview of the puzzle image
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Players</h2>
            <PlayersList players={players} currentPlayerId={currentPlayer.player_id} gameStatus={room.status} />
            
            <Separator className="my-6 bg-gray-700" />
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">About This Image</h3>
              <h4 className="font-semibold">{room.image_title}</h4>
              <p className="text-sm text-gray-300 mt-2 line-clamp-6">
                {room.image_explanation || 'NASA Astronomy Picture of the Day'}
              </p>
              <a 
                href={room.image_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
              >
                View Full Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;