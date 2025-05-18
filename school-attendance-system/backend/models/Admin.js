const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // To hash passwords

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash the password before saving
adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords (for consistency with Teacher model)
adminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing admin password:', error);
    return false;
  }
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
