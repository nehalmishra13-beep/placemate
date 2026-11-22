// Safe, repeatable seed. It only inserts or updates records from data/research/dataset.json.
// It never deletes users, progress, bookmarks or notes.   Run: npm run seed
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const Question = require('../src/models/Question');

async function runSeed({ log = console.log } = {}) {
  const data = require(path.join(__dirname, '..', 'data', 'research', 'dataset.json'));

  const companyIds = {};
  for (const c of data.companies) {
    const doc = await Company.findOneAndUpdate(
      { slug: c.slug },
      { ...c, lastReviewed: data.generated, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    companyIds[c.slug] = doc._id;
  }

  for (const q of data.questions) {
    const { company, codeEntry, ...rest } = q; // codeEntry is only used by the tests
    await Question.findOneAndUpdate(
      { dedupeKey: q.dedupeKey },
      { ...rest, company: company ? companyIds[company] : null, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  let admin = 'unchanged';
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const email = ADMIN_EMAIL.toLowerCase().trim();
    if (!(await User.exists({ email }))) {
      await User.create({ name: 'Admin', email, passwordHash: await User.hashPassword(ADMIN_PASSWORD), role: 'admin' });
      admin = `created (${email})`;
    } else admin = `already exists (${email})`;
  } else log('ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin created.');

  const counts = { companies: await Company.countDocuments(), questions: await Question.countDocuments() };
  log(`Seed complete. Companies: ${counts.companies}, questions: ${counts.questions}. Admin: ${admin}.`);
  return counts;
}

module.exports = runSeed;

if (require.main === module) {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Copy .env.example to .env first.');
    process.exit(1);
  }
  connectDB(process.env.MONGODB_URI)
    .then(() => runSeed())
    .then(() => mongoose.disconnect())
    .catch((e) => {
      console.error('Seed failed:', e.message);
      console.error('If you use Atlas, add your current IP under Network Access.');
      process.exit(1);
    });
}
