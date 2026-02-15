const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema: name, email (unique), hashed password, role (tenant | landlord), createdAt.
 * Password is hashed before saving (see pre-save hook below).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['tenant', 'landlord'],
      required: [true, 'Role is required'],
    },
  },
  { timestamps: true }
);

// Hash password before saving (only when password is modified).
// In Mongoose, async pre hooks don't receive next — we just return (or throw).
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper: compare plain password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
