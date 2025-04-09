import { get, post, put, del } from './network';

export const getCardList = (loginBody) => {
  return get('card-list', loginBody)
};

export const createCard = (cardData) => {
  return post('card', cardData)
}

export const getCardById = (cardId) => {
  return get(`card/${cardId}`)
}

export const updateCard = async (cardId, cardData) => {
  const response = await put(`card/${cardId}`, cardData);
  return response.data;
};

export const deleteCard = (cardId) => {
  return del(`card/${cardId}`)
}