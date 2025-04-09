import { get } from './network';

export const findGame = () => {
  return get('join-game')
};