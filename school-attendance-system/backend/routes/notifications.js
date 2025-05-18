const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Notification = require('../models/Notification');

// Get all notifications for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.userId,
      read: false
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark a notification as read
router.post('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Create a notification (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create notifications' });
    }
    
    const { recipient, title, message, type } = req.body;
    
    const notification = new Notification({
      recipient,
      title,
      message,
      type,
      createdBy: req.user._id
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

// Clear all notifications for the current user
router.delete('/clear-all', authMiddleware, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.userId
    });
    
    res.json({ 
      message: 'All notifications cleared successfully',
      count: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Error clearing notifications' });
  }
});

module.exports = router;
