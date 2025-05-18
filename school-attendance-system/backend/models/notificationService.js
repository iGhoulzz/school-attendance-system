const Notification = require('../models/Notification');

class NotificationService {
  static async createNotification(recipientId, recipientModel, title, message, type, createdBy) {
    try {
      const notification = new Notification({
        recipient: recipientId,
        recipientModel,
        title,
        message,
        type,
        createdBy
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  static async createSystemNotification(recipientId, recipientModel, title, message) {
    try {
      const systemAdmin = await require('../models/Admin').findOne({ role: 'admin' });
      if (!systemAdmin) {
        throw new Error('No system admin found');
      }
      
      return this.createNotification(
        recipientId,
        recipientModel,
        title,
        message,
        'system',
        systemAdmin._id
      );
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }
  
  static async createAttendanceNotification(recipientId, recipientModel, title, message) {
    try {
      const systemAdmin = await require('../models/Admin').findOne({ role: 'admin' });
      if (!systemAdmin) {
        throw new Error('No system admin found');
      }
      
      return this.createNotification(
        recipientId,
        recipientModel,
        title,
        message,
        'attendance',
        systemAdmin._id
      );
    } catch (error) {
      console.error('Error creating attendance notification:', error);
      throw error;
    }
  }
  
  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        recipient: userId,
        read: false
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
  
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
