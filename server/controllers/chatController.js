const { query, run } = require('../config/db');

// Get Chat Messages between two users
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // Other user ID
    const currentUserId = req.user.id;

    const messages = await query(
      `SELECT c.*, u1.full_name as sender_name, u2.full_name as receiver_name
       FROM Chats c
       JOIN Users u1 ON c.sender_id = u1.id
       JOIN Users u2 ON c.receiver_id = u2.id
       WHERE (c.sender_id = ? AND c.receiver_id = ?)
          OR (c.sender_id = ? AND c.receiver_id = ?)
       ORDER BY c.created_at ASC`,
      [currentUserId, userId, userId, currentUserId]
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
};

// Send Message
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !message) {
      return res.status(400).json({ success: false, message: 'Receiver ID and message content required' });
    }

    const cRes = await run(
      'INSERT INTO Chats (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [sender_id, receiver_id, message]
    );

    res.status(201).json({
      success: true,
      chat: {
        id: cRes.id,
        sender_id,
        receiver_id,
        message,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

module.exports = { getMessages, sendMessage };
