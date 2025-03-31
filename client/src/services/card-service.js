import { get, post } from './network';

export const getCardList = (loginBody) => {
  return get('card-list', loginBody)
};

export const createCard = (cardData) => {
  return post('card', cardData)
}