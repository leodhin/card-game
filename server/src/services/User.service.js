const UserModel = require('../models/User.model');

exports.getUserById = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

exports.getUserByNickname = async (nickname) => {
  try {
    const user = await UserModel.findOne({ nickname })
      .select('-password');

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}


exports.requestFriendship = async (userId, friendNickname) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const friendUser = await UserModel.findOne({ nickname: friendNickname });
    if (!friendUser) {
      throw new Error('Friend not found');
    }

    user.friendRequestsSent = user.friendRequestsSent || [];
    friendUser.friendRequestsReceived = friendUser.friendRequestsReceived || [];

    if (user.friendRequestsSent.includes(friendUser._id)) {
      throw new Error('Friend request already sent');
    }
    if (friendUser.friendRequestsReceived.includes(userId)) {
      throw new Error('Friend request already received');
    }

    user.friendRequestsSent.push(friendUser._id);
    friendUser.friendRequestsReceived.push(userId);

    await user.save();
    await friendUser.save();

    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

exports.getUserFriends = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
      .populate('friends', '-password')
      .populate('friendRequestsReceived', '-password')
      .populate('friendRequestsSent', '-password');

    if (!user) {
      throw new Error('User not found');
    }

    return {
      friends: user.friends.map(friend => ({
        nickname: friend.nickname,
      })),
      friendRequestsReceived: user.friendRequestsReceived.map(friend => friend.nickname),
      friendRequestsSent: user.friendRequestsSent.map(friend => friend.nickname),
    };
  } catch (error) {
    console.error('Error fetching user friends:', error);
    throw error;
  }
};

exports.acceptFriendRequest = async (userId, friendNickname) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const friendUser = await UserModel.findOne({ nickname: friendNickname });
    if (!friendUser) {
      throw new Error('Friend not found');
    }

    if (!user.friendRequestsReceived.includes(friendUser._id)) {
      throw new Error('No friend request received from this user');
    }

    user.friends = user.friends || [];
    friendUser.friends = friendUser.friends || [];
    user.friendRequestsReceived = user.friendRequestsReceived || [];
    friendUser.friendRequestsSent = friendUser.friendRequestsSent || [];
    if (user.friends.includes(friendUser._id)) {
      throw new Error('Already friends with this user');
    }
    user.friends.push(friendUser._id);
    friendUser.friends.push(user._id);
    user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== friendUser._id.toString());
    friendUser.friendRequestsSent = friendUser.friendRequestsSent.filter(id => id.toString() !== user._id.toString());
    await user.save();
    await friendUser.save();
    return true;
  }
  catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

exports.rejectFriendRequest = async (userId, friendNickname) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const friendUser = await UserModel.findOne({ nickname: friendNickname });
    if (!friendUser) {
      throw new Error('Friend not found');
    }

    if (!user.friendRequestsReceived.includes(friendUser._id)) {
      throw new Error('No friend request received from this user');
    }

    user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== friendUser._id.toString());
    friendUser.friendRequestsSent = friendUser.friendRequestsSent.filter(id => id.toString() !== user._id.toString());

    await user.save();
    await friendUser.save();

    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

exports.getAllUsers = async () => {
  try {
    const users = await UserModel.find().select('-password');
    if (!users) {
      throw new Error('No users found');
    }
    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

exports.consumeAIUsage = async (userId) => {
  try {
    const user = await UserModel
      .findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.aiUsageRemaining > 0) {
      user.aiUsageRemaining -= 1;
      await user.save();
      return true;
    } else {
      throw new Error('No AI usage left');
    }
  }
  catch (error) {
    console.error('Error consuming AI usage:', error);
    throw error;
  }
}