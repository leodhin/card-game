const { getNotificationsByUser, hasPendingNotifications } = require('../../services/Notification.service');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await getNotificationsByUser(userId);
    res.status(200).json(notifications);
  }
  catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPendingNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const hasPending = await hasPendingNotifications(userId);
    res.status(200).json({ hasPending });
  }
  catch (error) {
    console.error('Error checking pending notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}