const { supabase, query, run } = require('../config/db');

// Get Chat Messages between two users
const getMessages = async (req, res) => {
  try {
    const otherUserId = Number(req.params.userId);
    const currentUserId = Number(req.user.id);

    if (!otherUserId || isNaN(otherUserId)) {
      return res.status(400).json({ success: false, message: 'Valid target User ID required' });
    }

    let messages = [];

    if (supabase) {
      // Supabase direct query avoids broken execRaw / exec_sql RPC
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[getMessages Supabase error]', error.message);
      } else {
        messages = data || [];
      }
    } else {
      messages = await query(
        `SELECT * FROM Chats
         WHERE (sender_id = ? AND receiver_id = ?)
            OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at ASC`,
        [currentUserId, otherUserId, otherUserId, currentUserId]
      );
    }

    // Enrich messages with user names
    const users = await query(
      'SELECT id, full_name FROM Users WHERE id = ? OR id = ?',
      [currentUserId, otherUserId]
    );
    const userMap = {};
    (users || []).forEach(u => { userMap[u.id] = u.full_name; });

    const enrichedMessages = messages.map(m => ({
      ...m,
      sender_name: userMap[m.sender_id] || (m.sender_id === currentUserId ? 'You' : 'User'),
      receiver_name: userMap[m.receiver_id] || (m.receiver_id === currentUserId ? 'You' : 'User')
    }));

    res.json({ success: true, messages: enrichedMessages });
  } catch (error) {
    console.error('[getMessages exception]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
};

// Send Message
const sendMessage = async (req, res) => {
  try {
    const sender_id = Number(req.user.id);
    const receiver_id = Number(req.body.receiver_id);
    const message = (req.body.message || '').trim();

    if (!receiver_id || isNaN(receiver_id) || !message) {
      return res.status(400).json({ success: false, message: 'Receiver ID and message content are required' });
    }

    let chatRecord = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          sender_id,
          receiver_id,
          message,
          is_read: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('[sendMessage Supabase insert error]', error.message);
        throw new Error(error.message);
      }
      chatRecord = data;
    } else {
      const cRes = await run(
        'INSERT INTO Chats (sender_id, receiver_id, message) VALUES (?, ?, ?)',
        [sender_id, receiver_id, message]
      );
      chatRecord = {
        id: cRes.id,
        sender_id,
        receiver_id,
        message,
        created_at: new Date().toISOString()
      };
    }

    // Fetch sender's name
    const sender = await query('SELECT full_name FROM Users WHERE id = ?', [sender_id]);
    const senderName = sender[0]?.full_name || (req.user.role === 'hospital' ? 'Hospital Care Team' : 'User');

    // Create Notification record for receiver (safely handled)
    try {
      if (supabase) {
        await supabase.from('notifications').insert({
          user_id: receiver_id,
          title: `New Chat Message from ${senderName}`,
          message: message.length > 80 ? message.substring(0, 77) + '...' : message,
          type: 'MESSAGE',
          is_read: 0
        });
      } else {
        await run(
          'INSERT INTO Notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [receiver_id, `New Chat Message from ${senderName}`, message, 'MESSAGE']
        );
      }
    } catch (notifErr) {
      console.warn('[sendMessage Notification warning]', notifErr.message);
    }

    // Broadcast live event via WebSocket if available
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('NEW_NOTIFICATION', {
        user_id: receiver_id,
        title: `New Chat Message from ${senderName}`,
        message: message,
        type: 'MESSAGE'
      });
      broadcast('NEW_CHAT_MESSAGE', {
        chat: chatRecord
      });
    }

    res.status(201).json({
      success: true,
      chat: chatRecord
    });
  } catch (error) {
    console.error('[sendMessage error]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send message' });
  }
};

const getChatContacts = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const currentUserRole = req.user.role || 'donor';

    let chatRows = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('chats')
        .select('sender_id, receiver_id, created_at, message')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[getChatContacts Supabase error]', error.message);
      } else {
        chatRows = data || [];
      }
    } else {
      chatRows = await query(
        `SELECT sender_id, receiver_id, created_at, message FROM Chats WHERE sender_id = ? OR receiver_id = ? ORDER BY id DESC`,
        [currentUserId, currentUserId]
      );
    }

    const otherUserIds = new Set();
    (chatRows || []).forEach(row => {
      const sId = Number(row.sender_id);
      const rId = Number(row.receiver_id);
      if (sId && sId !== currentUserId) otherUserIds.add(sId);
      if (rId && rId !== currentUserId) otherUserIds.add(rId);
    });

    const allUsers = await query(`SELECT id, full_name, email, role, phone, city FROM Users`);
    let contacts = (allUsers || []).filter(u => otherUserIds.has(Number(u.id)) && Number(u.id) !== currentUserId);

    // If user is donor/receiver and has no active conversations yet, return all verified hospitals so they can immediately initiate chat
    if (contacts.length === 0 && (currentUserRole === 'donor' || currentUserRole === 'receiver')) {
      contacts = (allUsers || []).filter(u => u.role === 'hospital' && Number(u.id) !== currentUserId);
    }

    res.json({ success: true, contacts });
  } catch (error) {
    console.error('[getChatContacts error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve chat contacts' });
  }
};

module.exports = { getMessages, sendMessage, getChatContacts };
