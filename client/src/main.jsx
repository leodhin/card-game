import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import HomePage from './pages/home-page';
import GameArenaPage from './pages/game-arena';
import CardsListPage from './pages/cards-list';
import DeckListPage from './pages/deck-list';
import CardGeneratorPage from './pages/card-generator';
import DeckGeneratorPage from './pages/deck-generator';
import { LoginPage, RegisterPage } from './pages/authentication';
import NotFoundPage from './pages/not-found';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:roomName" element={<GameArenaPage />} />
        <Route path="/card-list" element={<CardsListPage />} />
        <Route path="/card-generator" element={<CardGeneratorPage />} />
        <Route path="/deck-generator" element={<DeckGeneratorPage />} />
        <Route path="/decks" element={<DeckListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);