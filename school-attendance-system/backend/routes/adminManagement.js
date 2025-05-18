const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const authMiddleware = require('../middlewares/authMiddleware');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../models/emailService');
const crypto = require('crypto');

// Create new admin (only existing admins can create new admins)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        // Check if the requester is an admin
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create new admin accounts' });
        }

        const { email, password, name } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const admin = new Admin({
            name,
            email,
            password: hashedPassword
        });

        await admin.save();

        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Error creating admin' });
    }
});

// Request password reset
router.post('/request-reset', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Admin.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        // Send email
        await sendEmail({
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`
        });

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting password reset', error: error.message });
    }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        const user = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
});

// Get all admins
router.get('/admins', authMiddleware, async (req, res) => {
    try {
        // Check if the requester is an admin
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can view admin list' });
        }

        const admins = await Admin.find({}, { password: 0, resetPasswordToken: 0, resetPasswordExpires: 0 }); // Exclude sensitive data from response
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Error fetching admins' });
    }
});

// Delete admin
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        // Check if the requester is an admin
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete admin accounts' });
        }

        // Prevent deleting self
        if (req.adminId === req.params.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Check if admin exists
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await Admin.findByIdAndDelete(req.params.id);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ message: 'Error deleting admin' });
    }
});

module.exports = router;
