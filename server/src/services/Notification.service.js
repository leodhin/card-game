const Notification = require('../models/Notification.model');

exports.getNotificationsByUser = async (userId) => {
  try {
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    return notifications;
  } catch (error) {
    throw new Error('Error fetching notifications');
  }
}

exports.hasPendingNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({ user: userId, read: false });
    return notifications.length > 0;
  } catch (error) {
    throw new Error('Error checking pending notifications');
  }
}

exports.addNotification = async (userId, type, message) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      message,
      isRead: false,
    });
    await notification.save();
    return notification;
  } catch (error) {
    throw new Error('Error adding notification');
  }
}