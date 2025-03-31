import { post, get, del } from './network';

export const createDeck = (deck) => {
  return post('deck', deck)
};

export const listDecks = () => {
  return get('deck-list')
};

export const deleteDeck = (deckId) => {
  return del(`deck/${deckId}`)
}