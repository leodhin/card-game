import { get } from './network';

export const getActiveGames = () => {
  return get('admin/active-games')
};