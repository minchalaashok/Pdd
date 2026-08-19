const { query, run } = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const notifications = await query(
      'SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [currentUserId]
    );
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    await run(
      'UPDATE Notifications SET is_read = ? WHERE user_id = ?',
      [1, currentUserId]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

module.exports = { getNotifications, markAllAsRead };
