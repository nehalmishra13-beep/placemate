// Private per-user records. Every query must filter by the logged-in user's id.
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const uq = { user: { type: ObjectId, ref: 'User', required: true }, question: { type: ObjectId, ref: 'Question', required: true } };

const progressSchema = new mongoose.Schema(
  {
    ...uq,
    status: { type: String, enum: ['attempted', 'solved'], required: true },
    attemptCount: { type: Number, default: 1 },
    lastAttemptAt: { type: Date, default: Date.now },
    solvedAt: Date,
  },
  { timestamps: true }
);
progressSchema.index({ user: 1, question: 1 }, { unique: true });

const bookmarkSchema = new mongoose.Schema(uq, { timestamps: true });
bookmarkSchema.index({ user: 1, question: 1 }, { unique: true });

const noteSchema = new mongoose.Schema({ ...uq, content: { type: String, required: true, maxlength: 5000 } }, { timestamps: true });
noteSchema.index({ user: 1, question: 1 }, { unique: true });

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['question', 'company'], required: true },
    targetId: { type: ObjectId, required: true },
    reason: { type: String, enum: ['incorrect-information', 'wrong-source', 'duplicate', 'inappropriate', 'other'], required: true },
    description: { type: String, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
    adminNote: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

const m = (n, s) => mongoose.models[n] || mongoose.model(n, s);
module.exports = {
  Progress: m('Progress', progressSchema),
  Bookmark: m('Bookmark', bookmarkSchema),
  Note: m('Note', noteSchema),
  Report: m('Report', reportSchema),
};
