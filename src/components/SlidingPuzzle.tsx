
import { useState, useEffect, useRef } from 'react';

interface Tile {
  id: number;
  currentPos: number;
  correctPos: number;
}

interface SlidingPuzzleProps {
  imageUrl: string;
  onComplete: () => void;
  onMove: (moves: number) => void;
}

const SlidingPuzzle = ({ imageUrl, onComplete, onMove }: SlidingPuzzleProps) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [emptyPos, setEmptyPos] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gridSize, setGridSize] = useState(4);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize the puzzle
  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      initializePuzzle();
      setIsLoading(false);
    };
  }, [imageUrl]);

  // Adjust container size based on window
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setGridSize(Math.min(Math.floor(width / 80), 4));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initializePuzzle = () => {
    const totalTiles = gridSize * gridSize;
    const initialTiles: Tile[] = [];
    
    // Create tiles in solved position first
    for (let i = 0; i < totalTiles - 1; i++) {
      initialTiles.push({
        id: i,
        currentPos: i,
        correctPos: i
      });
    }
    
    // Shuffle the tiles
    const shuffledTiles = shuffleTiles([...initialTiles]);
    setTiles(shuffledTiles);
    setEmptyPos(totalTiles - 1);
    setMoves(0);
    setIsComplete(false);
    onMove(0);
  };

  // Fisher-Yates shuffle algorithm with solvability check
  const shuffleTiles = (tilesArray: Tile[]): Tile[] => {
    const totalTiles = gridSize * gridSize - 1; // Excluding empty tile
    let shuffled = [...tilesArray];
    let currentIndex = totalTiles;
    
    // Shuffle
    while (currentIndex > 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      
      // Swap
      [shuffled[currentIndex].currentPos, shuffled[randomIndex].currentPos] = 
      [shuffled[randomIndex].currentPos, shuffled[currentIndex].currentPos];
    }
    
    // Check if puzzle is solvable
    if (!isSolvable(shuffled)) {
      // If not solvable, swap the first two tiles to make it solvable
      [shuffled[0].currentPos, shuffled[1].currentPos] = 
      [shuffled[1].currentPos, shuffled[0].currentPos];
    }
    
    return shuffled;
  };

  // Check if the puzzle is solvable
  const isSolvable = (tilesArray: Tile[]): boolean => {
    let inversions = 0;
    const positions = tilesArray.map(tile => tile.currentPos);
    
    for (let i = 0; i < positions.length - 1; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i] > positions[j]) {
          inversions++;
        }
      }
    }
    
    // For a 4x4 puzzle, it's solvable if:
    // 1. The empty tile is on an even row from the bottom and inversions is odd, or
    // 2. The empty tile is on an odd row from the bottom and inversions is even
    const emptyRow = Math.floor(emptyPos / gridSize);
    const fromBottom = gridSize - 1 - emptyRow;
    
    return (fromBottom % 2 === 0 && inversions % 2 === 1) || 
           (fromBottom % 2 === 1 && inversions % 2 === 0);
  };

  // Check if a tile can be moved
  const canMoveTile = (tilePos: number): boolean => {
    // Check if the tile is adjacent to the empty space
    const tileRow = Math.floor(tilePos / gridSize);
    const tileCol = tilePos % gridSize;
    const emptyRow = Math.floor(emptyPos / gridSize);
    const emptyCol = emptyPos % gridSize;
    
    return (
      (tileRow === emptyRow && Math.abs(tileCol - emptyCol) === 1) ||
      (tileCol === emptyCol && Math.abs(tileRow - emptyRow) === 1)
    );
  };

  // Move a tile
  const moveTile = (tilePos: number) => {
    if (isComplete || !canMoveTile(tilePos)) return;
    
    const newTiles = [...tiles];
    const tileIndex = newTiles.findIndex(t => t.currentPos === tilePos);
    
    if (tileIndex !== -1) {
      // Swap positions
      newTiles[tileIndex].currentPos = emptyPos;
      setEmptyPos(tilePos);
      setTiles(newTiles);
      
      // Increment moves
      const newMoves = moves + 1;
      setMoves(newMoves);
      onMove(newMoves);
      
      // Check if puzzle is complete
      checkCompletion(newTiles);
    }
  };

  // Check if the puzzle is complete
  const checkCompletion = (currentTiles: Tile[]) => {
    const isCompleted = currentTiles.every(tile => tile.currentPos === tile.correctPos);
    
    if (isCompleted) {
      setIsComplete(true);
      onComplete();
    }
  };

  // Calculate tile position and background position
  const getTileStyle = (tile: Tile) => {
    const tileSize = 100 / gridSize;
    const row = Math.floor(tile.currentPos / gridSize);
    const col = tile.currentPos % gridSize;
    
    // Calculate background position based on the original position
    const originalRow = Math.floor(tile.id / gridSize);
    const originalCol = tile.id % gridSize;
    
    return {
      width: `${tileSize}%`,
      height: `${tileSize}%`,
      top: `${row * tileSize}%`,
      left: `${col * tileSize}%`,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${gridSize * 100}%`,
      backgroundPosition: `-${originalCol * tileSize}% -${originalRow * tileSize}%`,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={containerRef}
        className="relative w-full max-w-lg aspect-square mx-auto bg-gray-900 rounded-lg overflow-hidden"
      >
        {tiles.map(tile => (
          <div
            key={tile.id}
            className="absolute cursor-pointer transition-all duration-200 ease-in-out"
            style={getTileStyle(tile)}
            onClick={() => moveTile(tile.currentPos)}
          >
            <div className="w-full h-full border border-gray-800 flex items-center justify-center">
              <span className="text-xs text-white bg-black bg-opacity-30 px-1 rounded">
                {tile.id + 1}
              </span>
            </div>
          </div>
        ))}
        
        {/* Empty tile */}
        <div
          className="absolute bg-gray-900"
          style={{
            width: `${100 / gridSize}%`,
            height: `${100 / gridSize}%`,
            top: `${Math.floor(emptyPos / gridSize) * (100 / gridSize)}%`,
            left: `${(emptyPos % gridSize) * (100 / gridSize)}%`,
          }}
        ></div>
        
        {/* Completion overlay */}
        {isComplete && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Puzzle Complete!</h3>
              <p className="text-gray-300">Total Moves: {moves}</p>
              <img 
                ref={imageRef}
                src={imageUrl} 
                alt="Completed puzzle" 
                className="mt-4 max-w-full max-h-64 rounded"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={initializePuzzle}
          variant="outline"
          className="text-sm"
          disabled={isComplete}
        >
          Restart Puzzle
        </Button>
      </div>
    </div>
  );
};

export default SlidingPuzzle;