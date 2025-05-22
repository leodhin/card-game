import HomePage from '../pages/home-page';
import GameArenaPage from '../pages/game-arena';
import CardsListPage from '../pages/cards-list';
import DeckListPage from '../pages/deck-list';
import CardGeneratorPage from '../pages/card-generator';
import DeckGeneratorPage from '../pages/deck-generator';
import { LoginPage, RegisterPage, ProfilePage } from '../pages/authentication';
import NotFoundPage from '../pages/not-found';
import DeckDetailsPage from "../pages/deck-details/DeckDetailsPage";
import FriendPage from "../pages/friends-page";

const routesConfig = [
  { path: '/', component: HomePage, private: true },
  { path: '/game/:roomName', hideHeader: true, component: GameArenaPage, private: true },
  { path: '/card-list', component: CardsListPage, private: true },
  { path: '/card-generator', component: CardGeneratorPage, private: true },
  { path: '/deck-generator', component: DeckGeneratorPage, private: true },
  { path: '/deck/:deckId', component: DeckDetailsPage, private: true },
  { path: '/decks', component: DeckListPage, private: true },
  { path: '/card/:cardId', component: CardGeneratorPage, private: true },
  { path: '/profile', component: ProfilePage, private: true },
  { path: '/friends', title: "Friends", component: FriendPage, private: true },
  { path: '/login', component: LoginPage, private: false },
  { path: '/register', component: RegisterPage, private: false },
  { path: '*', component: NotFoundPage, private: false },
];

export default routesConfig;