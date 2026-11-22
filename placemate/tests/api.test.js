process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret';
const TEST_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/placemate_test';
if (!/test/i.test(TEST_URI)) throw new Error('MONGODB_URI_TEST must point to a database whose name contains "test".');
process.env.MONGODB_URI = TEST_URI;

const request = require('supertest');
const mongoose = require('mongoose');
const createApp = require('../src/app');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const Question = require('../src/models/Question');
const { Report, Note } = require('../src/models/UserData');
const runSeed = require('../scripts/seed');

let app;
const H = { 'X-Requested-With': 'PlaceMate' };
const pw = 'Password1';
const agentFor = async (email, name = 'Test User') => {
  const a = request.agent(app);
  const r = await a.post('/api/auth/register').set(H).send({ name, email, password: pw });
  expect(r.status).toBe(201);
  return a;
};

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropDatabase();
  await Promise.all([User.init(), Company.init(), Question.init()]);
  app = createApp(TEST_URI);
  const amazon = await Company.create({ slug: 'amazon', name: 'Amazon', hiringProcess: [{ name: 'OA', description: 'x' }] });
  await Company.create({ slug: 'tcs', name: 'TCS' });
  const mk = (title, extra) => Question.create({ title, statement: 's', category: 'DSA', difficulty: 'Easy', verificationStatus: 'candidate-reported', dedupeKey: 'k:' + title, ...extra });
  await mk('Two Sum', { company: amazon._id, round: 'Online Assessment' });
  await mk('Binary Tree Views', { company: amazon._id, difficulty: 'Hard', round: 'Technical Interview' });
  await mk('Reverse List', { company: null, verificationStatus: 'practice' });
  for (let i = 0; i < 13; i++) await mk('Filler ' + i, { company: null, verificationStatus: 'practice' });
  await User.create({ name: 'Admin', email: 'admin@test.dev', passwordHash: await User.hashPassword(pw), role: 'admin' });
});
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await app.locals.sessionStore.close();
  await mongoose.disconnect();
});

describe('auth', () => {
  test('register, session persists, me, logout', async () => {
    const a = await agentFor('a1@test.dev');
    expect((await a.get('/api/auth/me')).body.data.email).toBe('a1@test.dev');
    await a.post('/api/auth/logout').set(H);
    expect((await a.get('/api/auth/me')).status).toBe(401);
  });
  test('login works and wrong password is rejected with a generic message', async () => {
    await agentFor('a2@test.dev');
    const ok = await request(app).post('/api/auth/login').set(H).send({ email: 'a2@test.dev', password: pw });
    expect(ok.status).toBe(200);
    const bad = await request(app).post('/api/auth/login').set(H).send({ email: 'a2@test.dev', password: 'Wrong123' });
    expect(bad.status).toBe(401);
    const none = await request(app).post('/api/auth/login').set(H).send({ email: 'nobody@test.dev', password: pw });
    expect(none.body.message).toBe(bad.body.message);
  });
  test('duplicate email gives 409', async () => {
    await agentFor('dup@test.dev');
    const r = await request(app).post('/api/auth/register').set(H).send({ name: 'X', email: 'DUP@test.dev', password: pw });
    expect(r.status).toBe(409);
  });
  test('validation: weak password, bad email, missing name', async () => {
    const post = (b) => request(app).post('/api/auth/register').set(H).send(b);
    expect((await post({ name: 'X', email: 'w@test.dev', password: 'short' })).status).toBe(400);
    expect((await post({ name: 'X', email: 'w@test.dev', password: 'alllowercase1' })).status).toBe(400);
    expect((await post({ name: 'X', email: 'nope', password: pw })).status).toBe(400);
    expect((await post({ email: 'w@test.dev', password: pw })).status).toBe(400);
  });
  test('cannot make yourself admin at registration', async () => {
    const r = await request(app).post('/api/auth/register').set(H).send({ name: 'Sneaky', email: 'sneaky@test.dev', password: pw, role: 'admin' });
    expect(r.status).toBe(201);
    expect(r.body.data.role).toBe('user');
    expect((await User.findOne({ email: 'sneaky@test.dev' })).role).toBe('user');
  });
  test('password is stored hashed', async () => {
    const u = await User.findOne({ email: 'a1@test.dev' });
    expect(u.passwordHash).not.toContain(pw);
    expect(u.passwordHash.startsWith('$2')).toBe(true);
  });
  test('NoSQL injection in login is rejected', async () => {
    const r = await request(app).post('/api/auth/login').set(H).send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(r.status).toBe(400);
  });
  test('state-changing request without the custom header is blocked (CSRF)', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'a2@test.dev', password: pw });
    expect(r.status).toBe(403);
  });
});

describe('companies and questions', () => {
  test('company list has question counts; profile works; unknown slug is 404', async () => {
    const list = await request(app).get('/api/companies');
    const amazon = list.body.data.find((c) => c.slug === 'amazon');
    expect(amazon.questionCount).toBe(2);
    const one = await request(app).get('/api/companies/amazon');
    expect(one.body.data.evidence['candidate-reported']).toBe(2);
    expect((await request(app).get('/api/companies/nope')).status).toBe(404);
  });
  test('filters: company, difficulty, evidence, round, search', async () => {
    const get = async (q) => (await request(app).get('/api/questions?' + q)).body;
    expect((await get('company=amazon')).pagination.total).toBe(2);
    expect((await get('company=amazon&difficulty=Hard')).data[0].title).toBe('Binary Tree Views');
    expect((await get('evidence=practice')).pagination.total).toBe(14);
    expect((await get('round=Online%20Assessment')).pagination.total).toBe(1);
    expect((await get('search=two%20sum')).pagination.total).toBe(1);
    expect((await get('company=general')).pagination.total).toBe(14);
    expect((await get('company=unknown')).pagination.total).toBe(0);
  });
  test('pagination', async () => {
    const p1 = (await request(app).get('/api/questions?limit=10&page=1')).body;
    const p2 = (await request(app).get('/api/questions?limit=10&page=2')).body;
    expect(p1.data).toHaveLength(10);
    expect(p2.data).toHaveLength(6);
    expect(p1.pagination.totalPages).toBe(2);
  });
  test('weird query values do not crash the server', async () => {
    expect((await request(app).get('/api/questions?category[a]=b&search[]=x&company[$ne]=1')).status).toBe(200);
  });
  test('detail, bad id and missing id', async () => {
    const id = (await Question.findOne({ title: 'Two Sum' }))._id;
    const r = await request(app).get('/api/questions/' + id);
    expect(r.body.data.company.slug).toBe('amazon');
    expect((await request(app).get('/api/questions/not-an-id')).status).toBe(404);
    expect((await request(app).get('/api/questions/' + new mongoose.Types.ObjectId())).status).toBe(404);
  });
  test('filters endpoint lists real values', async () => {
    const d = (await request(app).get('/api/questions/filters')).body.data;
    expect(d.companies.map((c) => c.slug)).toEqual(['amazon', 'tcs']);
    expect(d.rounds).toContain('Online Assessment');
  });
});

describe('private user data', () => {
  test('unauthenticated access is refused', async () => {
    for (const path of ['/api/dashboard', '/api/bookmarks', '/api/notes/' + new mongoose.Types.ObjectId()]) expect((await request(app).get(path)).status).toBe(401);
    expect((await request(app).post('/api/progress').set(H).send({})).status).toBe(401);
  });

  test('progress + dashboard numbers are calculated from real records', async () => {
    const a = await agentFor('prog@test.dev');
    const empty = (await a.get('/api/dashboard')).body.data;
    expect(empty.stats).toEqual({ attempted: 0, solved: 0, accuracy: 0, bookmarks: 0 });
    const byTitle = (t) => Question.findOne({ title: t });
    const [q1, q2, q3] = [await byTitle('Two Sum'), await byTitle('Binary Tree Views'), await byTitle('Reverse List')];
    await a.post('/api/progress').set(H).send({ questionId: String(q1._id), status: 'attempted' });
    await a.post('/api/progress').set(H).send({ questionId: String(q2._id), status: 'solved' });
    await a.post('/api/progress').set(H).send({ questionId: String(q3._id), status: 'attempted' });
    await a.post('/api/progress').set(H).send({ questionId: String(q1._id), status: 'solved' }); // upgrade, not a new record
    await a.post('/api/bookmarks').set(H).send({ questionId: String(q1._id) });
    const d = (await a.get('/api/dashboard')).body.data;
    expect(d.stats).toEqual({ attempted: 3, solved: 2, accuracy: 67, bookmarks: 1 });
    expect(d.companyProgress.find((c) => c.name === 'Amazon')).toMatchObject({ attempted: 2, solved: 2 });
    expect(d.topicProgress[0]).toMatchObject({ name: 'DSA', attempted: 3 });
    expect(d.weeklyActivity).toHaveLength(7);
    expect(d.weeklyActivity[6].count).toBe(3);
    const list = (await a.get('/api/questions?search=two%20sum')).body.data[0];
    expect(list).toMatchObject({ userStatus: 'solved', isBookmarked: true });
    expect((await a.delete('/api/progress/' + q3._id).set(H)).status).toBe(200);
    expect((await a.get('/api/dashboard')).body.data.stats.attempted).toBe(2);
  });

  test('progress validation', async () => {
    const a = await agentFor('pv@test.dev');
    expect((await a.post('/api/progress').set(H).send({ questionId: 'bad', status: 'solved' })).status).toBe(400);
    const q = await Question.findOne({ title: 'Two Sum' });
    expect((await a.post('/api/progress').set(H).send({ questionId: String(q._id), status: 'cheating' })).status).toBe(400);
    expect((await a.post('/api/progress').set(H).send({ questionId: String(new mongoose.Types.ObjectId()), status: 'solved' })).status).toBe(404);
  });

  test('bookmarks: add twice keeps one, remove works, users are isolated', async () => {
    const a = await agentFor('bm-a@test.dev');
    const b = await agentFor('bm-b@test.dev');
    const q = await Question.findOne({ title: 'Two Sum' });
    await a.post('/api/bookmarks').set(H).send({ questionId: String(q._id) });
    await a.post('/api/bookmarks').set(H).send({ questionId: String(q._id) });
    expect((await a.get('/api/bookmarks')).body.data).toHaveLength(1);
    expect((await b.get('/api/bookmarks')).body.data).toHaveLength(0);
    await b.delete('/api/bookmarks/' + q._id).set(H); // B cannot remove A's bookmark
    expect((await a.get('/api/bookmarks')).body.data).toHaveLength(1);
    await a.delete('/api/bookmarks/' + q._id).set(H);
    expect((await a.get('/api/bookmarks')).body.data).toHaveLength(0);
  });

  test('notes: user B can never read, change or delete user A notes', async () => {
    const a = await agentFor('note-a@test.dev');
    const b = await agentFor('note-b@test.dev');
    const q = await Question.findOne({ title: 'Two Sum' });
    await a.put('/api/notes/' + q._id).set(H).send({ content: 'secret idea' });
    expect((await a.get('/api/notes/' + q._id)).body.data.content).toBe('secret idea');
    expect((await b.get('/api/notes/' + q._id)).body.data).toBeNull();
    expect((await a.get('/api/questions/' + q._id)).body.data.userNote).toBe('secret idea');
    expect((await b.get('/api/questions/' + q._id)).body.data.userNote).toBeNull();
    await b.put('/api/notes/' + q._id).set(H).send({ content: 'B own note' });
    await b.delete('/api/notes/' + q._id).set(H);
    expect((await a.get('/api/notes/' + q._id)).body.data.content).toBe('secret idea');
    expect(await Note.countDocuments({ question: q._id })).toBe(1);
    expect((await a.put('/api/notes/' + q._id).set(H).send({ content: 'x'.repeat(5001) })).status).toBe(400);
  });
});

describe('reports and admin permissions', () => {
  test('normal users are refused admin routes; admin can use them', async () => {
    const u = await agentFor('plain@test.dev');
    for (const p of ['/api/admin/stats', '/api/admin/reports']) expect((await u.get(p)).status).toBe(403);
    expect((await request(app).get('/api/admin/stats')).status).toBe(401);

    const q = await Question.findOne({ title: 'Reverse List' });
    expect((await u.post('/api/reports').set(H).send({ targetType: 'question', targetId: String(q._id), reason: 'incorrect-information', description: 'wrong' })).status).toBe(201);
    expect((await u.post('/api/reports').set(H).send({ targetType: 'question', targetId: 'bad', reason: 'other' })).status).toBe(400);
    expect((await u.patch('/api/admin/reports/' + (await Report.findOne())._id).set(H).send({ status: 'resolved' })).status).toBe(403);

    const admin = request.agent(app);
    await admin.post('/api/auth/login').set(H).send({ email: 'admin@test.dev', password: pw });
    expect((await admin.get('/api/admin/stats')).body.data.pendingReports).toBe(1);
    const rep = (await admin.get('/api/admin/reports')).body.data[0];
    expect(rep.question.title).toBe('Reverse List');
    expect((await admin.patch('/api/admin/questions/' + q._id).set(H).send({ isActive: false })).body.data.isActive).toBe(false);
    expect((await request(app).get('/api/questions/' + q._id)).status).toBe(404); // hidden from the public
    await admin.patch('/api/admin/questions/' + q._id).set(H).send({ isActive: true });
    expect((await admin.patch('/api/admin/reports/' + rep._id).set(H).send({ status: 'resolved', adminNote: 'fixed' })).body.data.status).toBe('resolved');
    expect((await admin.get('/api/admin/stats')).body.data.pendingReports).toBe(0);
  });
  test('profile data cannot grant admin (no endpoint accepts role)', async () => {
    const u = await agentFor('r@test.dev');
    await u.patch('/api/auth/profile').set(H).send({ role: 'admin' });
    expect((await u.get('/api/admin/stats')).status).toBe(403);
  });
});

describe('stats, errors and seed', () => {
  test('public stats come from the database', async () => {
    const s = (await request(app).get('/api/stats')).body.data;
    expect(s.companies).toBe(2);
    expect(s.questions).toBe(16);
    expect(s.reportedQuestions).toBe(2);
    expect(s.practiceQuestions).toBe(14);
  });
  test('unknown API path is a JSON 404 and bad JSON is a 400', async () => {
    expect((await request(app).get('/api/nothing-here')).status).toBe(404);
    const r = await request(app).post('/api/auth/login').set(H).set('Content-Type', 'application/json').send('{bad');
    expect(r.status).toBe(400);
  });
  test('seed loads the research dataset and is safe to run twice', async () => {
    process.env.ADMIN_EMAIL = 'seed-admin@test.dev';
    process.env.ADMIN_PASSWORD = 'Seeded@12345';
    await mongoose.connection.dropDatabase();
    const quiet = { log: () => {} };
    const a = await runSeed(quiet);
    const b = await runSeed(quiet);
    expect(b).toEqual(a);
    expect(a.companies).toBe(4);
    expect(a.questions).toBeGreaterThanOrEqual(40);
    expect(await User.countDocuments({ role: 'admin' })).toBe(1);
    const verified = await Question.countDocuments({ verificationStatus: 'source-verified' });
    expect(verified).toBe(0); // nothing is claimed as source-verified without an official source
    expect(await Question.countDocuments({ verificationStatus: 'candidate-reported', 'sources.0': { $exists: false } })).toBe(0);
  });
});
