import { post } from './network';

export const login = (loginBody) => {
  return post('auth/login', loginBody)
};