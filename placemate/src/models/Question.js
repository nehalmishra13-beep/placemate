const mongoose = require('mongoose');

const EVIDENCE = ['source-verified', 'candidate-reported', 'practice'];
const CATEGORIES = ['DSA', 'DBMS', 'SQL', 'OOP', 'OS', 'Networks', 'Programming', 'Aptitude', 'HR', 'Behavioral', 'Other'];

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    statement: { type: String, required: true }, // written in our own words
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null }, // null = general practice
    role: String,
    category: { type: String, enum: CATEGORIES, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    round: String, // free text: "Online Assessment", "Technical Interview", ...
    verificationStatus: { type: String, enum: EVIDENCE, required: true },
    sources: [
      {
        url: String,
        title: String,
        sourceType: String,
        sourceDate: String, // "last updated" date shown on the page, not necessarily the interview date
        accessedDate: String,
      },
    ],
    approach: String,
    complexity: String,
    solutionCode: String, // JavaScript, only included when it has been run against tests
    notes: String,
    tags: [String],
    dedupeKey: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
schema.index({ company: 1, category: 1, difficulty: 1 });

const Question = mongoose.models.Question || mongoose.model('Question', schema);
Question.EVIDENCE = EVIDENCE;
Question.CATEGORIES = CATEGORIES;
module.exports = Question;
