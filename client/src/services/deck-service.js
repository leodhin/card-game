import { post, get, del, put } from './network';

export const createDeck = (deck) => {
  return post('deck', deck)
};

export const listDecks = () => {
  return get('deck-list')
};

export const deleteDeck = (deckId) => {
  return del(`deck/${deckId}`)
}

export const getDeck = (deckId) => {
  return get(`deck/${deckId}`)
};

export const updateDeck = (deckId, deck) => {
  return put(`deck/${deckId}`, deck)
};