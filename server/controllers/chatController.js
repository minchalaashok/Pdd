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
  console.log('💬 sendMessage request received:', { body: req.body, user: req.user });
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

    // Fetch sender's name
    const sender = await query('SELECT full_name FROM Users WHERE id = ?', [sender_id]);
    const senderName = sender[0]?.full_name || 'Hospital / Doctor';

    // Insert Notification record for receiver
    await run(
      'INSERT INTO Notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [receiver_id, `New Chat Message from ${senderName}`, message, 'MESSAGE']
    );

    // Broadcast live event via WebSocket
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('NEW_NOTIFICATION', {
        user_id: receiver_id,
        title: `New Chat Message from ${senderName}`,
        message: message,
        type: 'MESSAGE'
      });
    }

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

const getChatContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get unique user IDs of people who have sent or received messages to/from currentUserId
    const contacts = await query(
      `SELECT DISTINCT u.id, u.full_name, u.role, u.email
       FROM Chats c
       JOIN Users u ON (c.sender_id = u.id OR c.receiver_id = u.id)
       WHERE (c.sender_id = ? OR c.receiver_id = ?) AND u.id != ?`,
      [currentUserId, currentUserId, currentUserId]
    );

    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve chat contacts' });
  }
};

module.exports = { getMessages, sendMessage, getChatContacts };
