
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import websocketService from '../services/websocket';

interface NasaImage {
  url: string;
  title: string;
  date: string;
  explanation: string;
}

interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isComplete: boolean;
  completionTime?: number;
}

interface GameContextType {
  roomId: string | null;
  playerId: string;
  playerName: string;
  players: Player[];
  nasaImage: NasaImage | null;
  isLoading: boolean;
  error: string | null;
  createRoom: (playerName: string) => string;
  joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;
  setPlayerReady: (isReady: boolean) => void;
  setPlayerComplete: (completionTime: number) => void;
  fetchNasaImage: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [nasaImage, setNasaImage] = useState<NasaImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a unique ID for the player when the component mounts
  useEffect(() => {
    setPlayerId(generateId());
  }, []);

  // Set up WebSocket event listeners
  useEffect(() => {
    // Handle player joined event
    const handlePlayerJoined = (message: any) => {
      if (roomId && message.data.roomId === roomId) {
        setPlayers(prev => [...prev, message.data.player]);
      }
    };

    // Handle player left event
    const handlePlayerLeft = (message: any) => {
      if (roomId && message.data.roomId === roomId) {
        setPlayers(prev => prev.filter(player => player.id !== message.data.playerId));
      }
    };

    // Handle player ready event
    const handlePlayerReady = (message: any) => {
      if (roomId && message.data.roomId === roomId) {
        setPlayers(prev => 
          prev.map(player => 
            player.id === message.data.playerId 
              ? { ...player, isReady: message.data.isReady } 
              : player
          )
        );
      }
    };

    // Handle player complete event
    const handlePlayerComplete = (message: any) => {
      if (roomId && message.data.roomId === roomId) {
        setPlayers(prev => 
          prev.map(player => 
            player.id === message.data.playerId 
              ? { ...player, isComplete: true, completionTime: message.data.completionTime } 
              : player
          )
        );
      }
    };

    // Register event handlers
    websocketService.on('player-joined', handlePlayerJoined);
    websocketService.on('player-left', handlePlayerLeft);
    websocketService.on('player-ready', handlePlayerReady);
    websocketService.on('player-complete', handlePlayerComplete);

    // Cleanup function
    return () => {
      websocketService.off('player-joined', handlePlayerJoined);
      websocketService.off('player-left', handlePlayerLeft);
      websocketService.off('player-ready', handlePlayerReady);
      websocketService.off('player-complete', handlePlayerComplete);
    };
  }, [roomId]);

  // Function to generate a random ID
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Create a new room
  const createRoom = (name: string): string => {
    const newRoomId = generateId();
    setRoomId(newRoomId);
    setPlayerName(name);
    
    // Add the creator as the first player
    const newPlayer = {
      id: playerId,
      name,
      isReady: false,
      isComplete: false
    };
    
    setPlayers([newPlayer]);
    
    // Join the WebSocket room
    websocketService.joinRoom(newRoomId, playerId);
    
    return newRoomId;
  };

  // Join an existing room
  const joinRoom = (id: string, name: string) => {
    setRoomId(id);
    setPlayerName(name);
    
    // Create player object
    const newPlayer = {
      id: playerId,
      name,
      isReady: false,
      isComplete: false
    };
    
    // Add the player to the room
    setPlayers(prev => [...prev, newPlayer]);
    
    // Join the WebSocket room and broadcast the join event
    websocketService.joinRoom(id, playerId);
    websocketService.broadcast(id, 'player-joined', { 
      roomId: id, 
      player: newPlayer 
    });
  };

  // Leave the current room
  const leaveRoom = () => {
    if (roomId) {
      // Leave the WebSocket room and broadcast the leave event
      websocketService.leaveRoom(roomId, playerId);
      websocketService.broadcast(roomId, 'player-left', { 
        roomId, 
        playerId 
      });
    }
    
    setRoomId(null);
    setPlayerName('');
    setPlayers([]);
    setNasaImage(null);
  };

  // Set player ready status
  const setPlayerReady = (isReady: boolean) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, isReady } 
          : player
      )
    );
    
    // Broadcast the ready status change
    if (roomId) {
      websocketService.broadcast(roomId, 'player-ready', { 
        roomId, 
        playerId, 
        isReady 
      });
    }
  };

  // Set player completion status
  const setPlayerComplete = (completionTime: number) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, isComplete: true, completionTime } 
          : player
      )
    );
    
    // Broadcast the completion status
    if (roomId) {
      websocketService.broadcast(roomId, 'player-complete', { 
        roomId, 
        playerId, 
        completionTime 
      });
    }
  };

  // Fetch a random NASA image
  const fetchNasaImage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
      
      if (!response.ok) {
        throw new Error('Failed to fetch NASA image');
      }
      
      const data = await response.json();
      setNasaImage({
        url: data.url,
        title: data.title,
        date: data.date,
        explanation: data.explanation
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    roomId,
    playerId,
    playerName,
    players,
    nasaImage,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    setPlayerReady,
    setPlayerComplete,
    fetchNasaImage
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};