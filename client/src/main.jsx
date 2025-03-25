import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import './index.css';

import HomePage from './pages/home-page';
import GameArenaPage from './pages/game-arena';
import CardsListPage from './pages/cards-list';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:roomName" element={<GameArenaPage />} />
        <Route path="/cards" element={<CardsListPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);