import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () { return !this.provider || this.provider === 'local'; } },
  name: { type: String, required: true },
  photo: { type: String },
  provider: { type: String, default: 'local' }, // 'local' or 'google'
  fieldOfStudy: { type: String },
  selectedExam: { type: String },
  role: { type: String, enum: ['user', 'admin','superadmin'], default: 'user' },
  isActive: { type: Boolean, default: true }
});

// Password hashing for local login users
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.provider === 'google') {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);

export default User;
