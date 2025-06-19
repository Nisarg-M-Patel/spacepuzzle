
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

// Store rooms and players
const rooms = new Map();

// NASA API endpoint
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';

// Fetch NASA image
async function fetchNasaImage() {
  try {
    const response = await fetch(NASA_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch NASA image');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching NASA image:', error);
    return null;
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create-room', async (playerName) => {
    const roomId = Math.random().toString(36).substring(2, 9);
    const playerId = socket.id;
    
    // Fetch NASA image for the room
    const nasaImage = await fetchNasaImage();
    
    // Create room data
    rooms.set(roomId, {
      players: [{
        id: playerId,
        name: playerName,
        isReady: false,
        isComplete: false
      }],
      nasaImage,
      gameStarted: false
    });
    
    // Join the socket.io room
    socket.join(roomId);
    
    // Send room data back to client
    socket.emit('room-created', {
      roomId,
      playerId,
      nasaImage
    });
    
    console.log(`Room created: ${roomId} by player ${playerName}`);
  });

  // Join an existing room
  socket.on('join-room', async (data) => {
    const { roomId, playerName } = data;
    const playerId = socket.id;
    
    // Check if room exists
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const room = rooms.get(roomId);
    
    // Add player to room
    const newPlayer = {
      id: playerId,
      name: playerName,
      isReady: false,
      isComplete: false
    };
    
    room.players.push(newPlayer);
    
    // Join the socket.io room
    socket.join(roomId);
    
    // Send room data to the new player
    socket.emit('room-joined', {
      roomId,
      playerId,
      players: room.players,
      nasaImage: room.nasaImage,
      gameStarted: room.gameStarted
    });
    
    // Notify other players
    socket.to(roomId).emit('player-joined', {
      player: newPlayer
    });
    
    console.log(`Player ${playerName} joined room ${roomId}`);
  });

  // Player ready status change
  socket.on('player-ready', (data) => {
    const { roomId, isReady } = data;
    
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    const player = room.players.find(p => p.id === socket.id);
    
    if (player) {
      player.isReady = isReady;
      
      // Notify all players in the room
      io.to(roomId).emit('player-status-updated', {
        players: room.players
      });
      
      // Check if all players are ready
      const allReady = room.players.length > 0 && room.players.every(p => p.isReady);
      
      if (allReady && !room.gameStarted) {
        // Start countdown
        let countdown = 3;
        
        const timer = setInterval(() => {
          io.to(roomId).emit('countdown', { countdown });
          
          countdown--;
          
          if (countdown < 0) {
            clearInterval(timer);
            room.gameStarted = true;
            io.to(roomId).emit('game-started');
          }
        }, 1000);
      }
    }
  });

  // Player completed puzzle
  socket.on('player-complete', (data) => {
    const { roomId, completionTime } = data;
    
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    const player = room.players.find(p => p.id === socket.id);
    
    if (player) {
      player.isComplete = true;
      player.completionTime = completionTime;
      
      // Notify all players in the room
      io.to(roomId).emit('player-status-updated', {
        players: room.players
      });
    }
  });

  // Player leaves
  socket.on('leave-room', (roomId) => {
    handlePlayerDisconnect(socket, roomId);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find which room this player was in
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.some(p => p.id === socket.id)) {
        handlePlayerDisconnect(socket, roomId);
        break;
      }
    }
  });
});

// Handle player disconnect or leaving
function handlePlayerDisconnect(socket, roomId) {
  if (!rooms.has(roomId)) return;
  
  const room = rooms.get(roomId);
  
  // Remove player from room
  const playerIndex = room.players.findIndex(p => p.id === socket.id);
  
  if (playerIndex !== -1) {
    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    
    // Leave the socket.io room
    socket.leave(roomId);
    
    // Notify other players
    socket.to(roomId).emit('player-left', {
      playerId: socket.id
    });
    
    console.log(`Player ${player.name} left room ${roomId}`);
    
    // If room is empty, delete it
    if (room.players.length === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  }
}

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});