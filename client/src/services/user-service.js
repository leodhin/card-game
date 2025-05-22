import { get, post } from './network';

export const getProfile = () => {
  return get('user/profile')
}

export const requestFriendship = (nickname) => {
  return post('user/add-friend', { friendNickname: nickname });
};

export const acceptFriendRequest = (friendNickname) => {
  return post('user/accept-friend-request', { friendNickname });
};

export const rejectFriendRequest = (friendNickname) => {
  return post('user/reject-friend-request', { friendNickname });
}

export const getFriends = () => {
  return get('user/friends');
}