const User = require('../../models/User.model');
const { getMatchHistory } = require('../../services/game.service');
const { requestFriendship, getUserFriends, acceptFriendRequest, rejectFriendRequest, getAllUsers, getUserByNickname } = require('../../services/User.service');
const { addNotification } = require('../../services/Notification.service');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matchHistory = await getMatchHistory(userId);
    if (!matchHistory) {
      return res.status(404).json({ error: 'Match history not found' });
    }


    return res.status(200).json({
      user,
      matchHistory,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.getProfileByNickname = async (req, res) => {
  try {
    const nickname = req.params.nickname;
    const user = await getUserByNickname(nickname);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matchHistory = await getMatchHistory(user._id);
    if (!matchHistory) {
      return res.status(404).json({ error: 'Match history not found' });
    }
    return res.status(200).json({
      user,
      matchHistory,
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Error fetching user by ID', error: error.message });
  }
};


exports.addPerson = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await requestFriendship(userId, req.body?.friendNickname);
    if (result) {
      const notification = await addNotification(userId, 'info', `You have a new friend request from ${req.body?.friendNickname}`);
      res.status(200).json({ message: 'User friendship request successfully requested' });
    }
    else {
      res.status(400).json({ message: 'Failed to add person' });
    }
  } catch (err) {
    console.error('Error adding person:', err);
    res.status(500).json({ error: 'Error adding person.' });
  }
}

exports.acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await acceptFriendRequest(userId, req.body?.friendNickname);
    if (result) {
      res.status(200).json({ message: 'Friend request accepted' });
    } else {
      res.status(400).json({ message: 'Failed to accept friend request' });
    }
  } catch (err) {
    console.error('Error accepting friend request:', err);
    res.status(500).json({ error: 'Error accepting friend request.' });
  }
}

exports.rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await rejectFriendRequest(userId, req.body?.friendNickname);
    if (result) {
      res.status(200).json({ message: 'Friend request rejected' });
    } else {
      res.status(400).json({ message: 'Failed to reject friend request' });
    }
  } catch (err) {
    console.error('Error rejecting friend request:', err);
    res.status(500).json({ error: 'Error rejecting friend request.' });
  }
}

exports.getFriends = async (req, res) => {
  try {
    const userId = req.userId;
    const friends = await getUserFriends(userId);
    if (!friends) {
      return res.status(404).json({ error: 'No friends found' });
    }
    return res.status(200).json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Error fetching friends', error: error.message });
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    if (!users) {
      return res.status(404).json({ error: 'No users found' });
    }
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching all users', error: error.message });
  }
}