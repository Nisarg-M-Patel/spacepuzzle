
interface Player {
  id: string;
  player_id: string;
  player_name: string;
  is_host: boolean;
  moves_count: number;
  completed_at: string | null;
}

interface PlayersListProps {
  players: Player[];
  currentPlayerId: string;
  gameStatus: string;
}

const PlayersList = ({ players, currentPlayerId, gameStatus }: PlayersListProps) => {
  // Sort players: host first, then by completion time (if game is completed)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.is_host && !b.is_host) return -1;
    if (!a.is_host && b.is_host) return 1;
    
    if (gameStatus === 'completed') {
      if (a.completed_at && !b.completed_at) return -1;
      if (!a.completed_at && b.completed_at) return 1;
      if (a.completed_at && b.completed_at) {
        return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
      }
    }
    
    return 0;
  });

  return (
    <div className="space-y-2">
      {sortedPlayers.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No players have joined yet</p>
      ) : (
        sortedPlayers.map((player, index) => (
          <div 
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-md ${
              player.player_id === currentPlayerId 
                ? 'bg-blue-900 bg-opacity-30' 
                : 'bg-gray-700 bg-opacity-30'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                {index + 1}
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium">
                    {player.player_id === currentPlayerId ? 'You' : `Player ${index + 1}`}
                  </span>
                  {player.is_host && (
                    <span className="ml-2 text-xs bg-yellow-600 px-1.5 py-0.5 rounded text-yellow-100">
                      Host
                    </span>
                  )}
                </div>
                {gameStatus === 'playing' && (
                  <div className="text-xs text-gray-400 mt-1">
                    Moves: {player.moves_count || 0}
                  </div>
                )}
                {gameStatus === 'completed' && player.completed_at && (
                  <div className="text-xs text-green-400 mt-1">
                    Completed in {player.moves_count || 0} moves
                  </div>
                )}
              </div>
            </div>
            
            {gameStatus === 'playing' && (
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            )}
            
            {gameStatus === 'completed' && (
              <div className="text-xl">
                {index === 0 && player.completed_at ? '🏆' : ''}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PlayersList;