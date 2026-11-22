const mongoose = require('mongoose');

const link = { url: String, title: String, sourceType: String, accessedDate: String };

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    overview: String,
    roles: [String],
    // Each round: { name, description }. Always historical, candidate-reported unless a source says otherwise.
    hiringProcess: [{ name: String, description: String }],
    hiringSources: [link],
    topics: [String],
    prepResources: [{ title: String, url: String, note: String }],
    dataNote: String, // what is and is not covered for this company
    lastReviewed: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Company || mongoose.model('Company', schema);
