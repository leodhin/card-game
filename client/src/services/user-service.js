import { get } from './network';

export const getProfile = () => {
  return get('user/profile')
}