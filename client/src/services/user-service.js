import { get, post, put } from './network';

export const getProfile = () => {
  return get('user/profile')
}

export const getProfileById = (id) => {
  return get(`user/${id}`);
}

export const updateProfilePicture = (picture) => {
  return put('user/profile-picture', { picture });
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

export const getAllUsers = () => {
  return get('user/all-users');
}

export const getNotifications = () => {
  return get('notifications');
}

export const hasPendingNotifications = () => {
  return get('notifications/pending');
}