
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

interface PuzzleTile {
  id: number;
  currentPosition: number;
  correctPosition: number;
  imageUrl: string;
}

interface PuzzleProps {
  image: {
    url: string;
    title: string;
  };
}

const Puzzle: React.FC<PuzzleProps> = ({ image }) => {
  const { setPlayerComplete } = useGame();
  const [tiles, setTiles] = useState<PuzzleTile[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(3); // 3x3 grid by default
  
  // Initialize the puzzle
  useEffect(() => {
    initializePuzzle();
    setStartTime(Date.now());
  }, [image.url, gridSize]);
  
  // Check if the puzzle is complete
  useEffect(() => {
    if (tiles.length === 0) return;
    
    const complete = tiles.every(tile => tile.currentPosition === tile.correctPosition);
    
    if (complete && !isComplete) {
      const completionTime = Date.now() - startTime;
      setIsComplete(true);
      setPlayerComplete(completionTime);
    }
  }, [tiles, isComplete, startTime, setPlayerComplete]);
  
  const initializePuzzle = async () => {
    // Create an image element to load the NASA image
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = image.url;
    
    img.onload = () => {
      // Create a canvas to slice the image into tiles
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const totalTiles = gridSize * gridSize;
      const tileWidth = img.width / gridSize;
      const tileHeight = img.height / gridSize;
      
      // Create tiles
      const newTiles: PuzzleTile[] = [];
      
      for (let i = 0; i < totalTiles; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        
        canvas.width = tileWidth;
        canvas.height = tileHeight;
        
        // Draw the portion of the image for this tile
        ctx.drawImage(
          img,
          col * tileWidth,
          row * tileHeight,
          tileWidth,
          tileHeight,
          0,
          0,
          tileWidth,
          tileHeight
        );
        
        // Convert canvas to data URL
        const tileImageUrl = canvas.toDataURL('image/jpeg');
        
        newTiles.push({
          id: i,
          correctPosition: i,
          currentPosition: i,
          imageUrl: tileImageUrl
        });
      }
      
      // Shuffle the tiles (except for the last one which will be empty)
      const shuffledTiles = [...newTiles];
      for (let i = shuffledTiles.length - 2; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTiles[i].currentPosition, shuffledTiles[j].currentPosition] = 
        [shuffledTiles[j].currentPosition, shuffledTiles[i].currentPosition];
      }
      
      setTiles(shuffledTiles);
    };
  };
  
  const handleTileClick = (clickedTileIndex: number) => {
    if (isComplete) return;
    
    const clickedTile = tiles.find(tile => tile.currentPosition === clickedTileIndex);
    if (!clickedTile) return;
    
    // Check if the clicked tile can move (adjacent to an empty space)
    const emptyTileIndex = tiles.findIndex(tile => tile.id === tiles.length - 1);
    const emptyTilePosition = tiles[emptyTileIndex].currentPosition;
    
    // Calculate row and column of clicked tile and empty tile
    const clickedRow = Math.floor(clickedTileIndex / gridSize);
    const clickedCol = clickedTileIndex % gridSize;
    const emptyRow = Math.floor(emptyTilePosition / gridSize);
    const emptyCol = emptyTilePosition % gridSize;
    
    // Check if the clicked tile is adjacent to the empty tile
    const isAdjacent = (
      (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
      (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow)
    );
    
    if (isAdjacent) {
      // Swap the positions
      const newTiles = [...tiles];
      const clickedTileIndex = tiles.findIndex(tile => tile.currentPosition === clickedTileIndex);
      
      [newTiles[clickedTileIndex].currentPosition, newTiles[emptyTileIndex].currentPosition] = 
      [newTiles[emptyTileIndex].currentPosition, newTiles[clickedTileIndex].currentPosition];
      
      setTiles(newTiles);
    }
  };
  
  const changeGridSize = (size: number) => {
    setGridSize(size);
    setIsComplete(false);
  };
  
  return (
    <div className="card">
      <h2>Solve the Puzzle!</h2>
      
      <div className="mb-4">
        <label>Grid Size: </label>
        <select 
          value={gridSize} 
          onChange={(e) => changeGridSize(parseInt(e.target.value))}
          disabled={isComplete}
        >
          <option value="2">2x2 (Easy)</option>
          <option value="3">3x3 (Medium)</option>
          <option value="4">4x4 (Hard)</option>
          <option value="5">5x5 (Expert)</option>
        </select>
      </div>
      
      {isComplete && (
        <div className="mb-4 text-center" style={{ color: 'green' }}>
          <h3>Puzzle Complete! 🎉</h3>
          <p>You finished in {((Date.now() - startTime) / 1000).toFixed(2)} seconds</p>
        </div>
      )}
      
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          gap: '2px',
          maxWidth: '500px',
          margin: '0 auto'
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const tile = tiles.find(t => t.currentPosition === index);
          const isEmptyTile = tile?.id === tiles.length - 1;
          
          return (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              style={{
                aspectRatio: '1/1',
                border: '1px solid #444',
                cursor: isComplete ? 'default' : 'pointer',
                backgroundColor: isEmptyTile ? 'transparent' : 'var(--secondary)',
                backgroundImage: !isEmptyTile && tile ? `url(${tile.imageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          );
        })}
      </div>
      
      {!isComplete && (
        <button 
          onClick={initializePuzzle} 
          className="mt-4"
          style={{ display: 'block', margin: '1rem auto' }}
        >
          Restart Puzzle
        </button>
      )}
    </div>
  );
};

export default Puzzle;