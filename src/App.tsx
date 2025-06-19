
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import { GameProvider } from './context/GameContext';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;