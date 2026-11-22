const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    // Only the seed script (or a database admin) can create an admin.
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12;
schema.statics.hashPassword = (pw) => bcrypt.hash(pw, ROUNDS);
schema.methods.checkPassword = function (pw) {
  return bcrypt.compare(pw, this.passwordHash);
};
schema.methods.toPublic = function () {
  return { id: this._id, name: this.name, email: this.email, role: this.role };
};

module.exports = mongoose.models.User || mongoose.model('User', schema);
