README · MD PlaceMate

Your companion for placement prep.

PlaceMate is a full-stack web app that helps engineering students prepare for campus placements company by company. Students can read the hiring rounds that candidates report, practise interview questions filtered by topic, difficulty and round, and track their own progress. Every question carries an honest evidence label, so practice material is never passed off as a real interview question.

Live demo: https://placemate-zkhh.onrender.com

Built with HTML, CSS and vanilla JavaScript on the frontend, Node.js and Express on the backend, and MongoDB with Mongoose for storage.

Table of contents Features Evidence labels Current data Tech stack Getting started Environment variables Running the tests Project structure How it works API overview Security Deployment Troubleshooting Known limitations Roadmap Author Features Company profiles: hiring rounds, topics to prepare, and the source pages behind them, with the date each was read. Question bank: keyword search, filters for company, topic, difficulty, round and evidence type, and pagination. Question detail: sources with links, an original explanation, complexity notes, and tested JavaScript solutions where available. Accounts: register, log in and log out, with bcrypt-hashed passwords and server-side sessions. Private progress: mark questions attempted or solved, bookmark them, and keep personal notes. Dashboard: attempted and solved counts, accuracy, topic and company progress, recent activity and a 7-day chart, all calculated from the user's own records. Reports and admin: students can report a wrong question or source. An admin resolves or dismisses reports and can hide or restore a question. Evidence labels

Every question is labelled so you always know how well it is supported.

Label Meaning Candidate-reported A public candidate account says this was asked. The wording in PlaceMate is our own rewrite, and the source is linked. Source-verified Supported by an identifiable official source. None are claimed yet. Practice question Useful preparation material that is not verified as asked in a real interview.

Hiring processes change by role, campus and year. Each company page says what is and is not covered.

Current data Company Candidate-reported Practice Amazon 14 1 Microsoft 4 1 TCS 7 0 Infosys 7 0 General practice 0 8 Total 32 10

Sources are public pages (mostly GeeksforGeeks interview experiences, plus Glassdoor reviews and one third-party summary), read on 16 November 2026. Only items traceable to a source are included, so the dataset is small by design. Eleven questions ship with solution code, and each of those solutions is run against test cases by the test suite.

Tech stack Layer Technology Frontend HTML5, CSS3, vanilla JavaScript (ES6+) Backend Node.js 18+, Express 4, REST API Database MongoDB, Mongoose 8 Auth express-session, connect-mongo, bcryptjs Security Helmet, express-rate-limit, express-validator, express-mongo-sanitize Testing Jest, Supertest Getting started Prerequisites Node.js 18 or newer MongoDB: a local install, or a free MongoDB Atlas cluster Installation bash git clone cd placemate npm install

Create your environment file:

bash

Mac or Linux
cp .env.example .env

Windows (Command Prompt)
copy .env.example .env

Open .env and fill in your values (see Environment variables).

Load the data and start the app bash npm run seed # loads companies and questions, and creates the admin account npm run dev # starts the site at http://localhost:5000

On Windows PowerShell, use npm.cmd instead of npm if scripts are blocked.

The seed script is safe to run more than once. It inserts or updates the dataset and creates the admin only if it does not exist yet. It never deletes users, progress, bookmarks or notes.

Using MongoDB Atlas Create a cluster and a database user, then copy the connection string. Put a database name in the string, for example .../placemate. Atlas does not add one for you. Under Network Access, allow your current IP address. If your password has special characters, URL-encode them (@ becomes %40). Environment variables

Copy .env.example to .env. Never commit .env.

Variable Description MONGODB_URI Connection string for the app database, for example mongodb://127.0.0.1:27017/placemate MONGODB_URI_TEST A separate database used only by the tests. Its name must contain "test". SESSION_SECRET A long random string used to sign session cookies ADMIN_EMAIL Email of the admin account created by the seed ADMIN_PASSWORD Password for that admin. Change it before seeding. NODE_ENV development or production PORT Port to listen on (default 5000) Running the tests bash npm test

The tests need a reachable MongoDB and use MONGODB_URI_TEST. They drop that database, so never point it at your real data. The test file refuses to run if the database name does not contain "test".

There are 40 tests:

24 API tests: registration and login, duplicate email, validation, role cannot be set at registration, password hashing, NoSQL injection, missing CSRF header, company and question endpoints, filters and pagination, progress and dashboard calculations, bookmarks, notes, one user unable to read or change another user's data, admin permissions, reports, statistics, error handling, and seeding twice. 16 dataset and solution tests: every reported question has a source, practice questions cite none, source URLs and dates exist, no duplicates, and all 11 shipped solutions pass test cases. Project structure placemate/ ├── src/ │ ├── server.js Connects to MongoDB and starts the server │ ├── app.js Builds the Express app (security, sessions, routes) │ ├── config/db.js MongoDB connection │ ├── models/ Mongoose schemas: User, Company, Question, UserData │ ├── routes/ auth, companies, questions, user, admin, stats │ └── middleware/ auth checks, validation helpers, error handler ├── public/ Frontend │ ├── *.html Home, companies, company, questions, question, login, dashboard, admin │ ├── css/main.css │ └── js/ api.js, nav.js and one script per page ├── data/research/dataset.json Sourced companies and questions ├── scripts/ │ ├── build_dataset.py Where researched data and its sources are written │ └── seed.js Loads the dataset into MongoDB ├── tests/ api.test.js and solutions.test.js ├── .env.example ├── API.md Full API reference └── README.md How it works The browser loads an HTML page from the Express server. The page's JavaScript calls the REST API with fetch (for example GET /api/companies/amazon) and receives JSON. Express validates the request, applies security middleware, and reads or writes MongoDB through Mongoose. The JavaScript builds the page from the JSON using safe DOM methods (textContent, never innerHTML). Login sessions are stored in MongoDB. The browser keeps only an HttpOnly cookie, and the server reads the user's id from that session on every request.

To add or change research data, edit scripts/build_dataset.py (only add sources you have actually read), run python3 scripts/build_dataset.py, then run npm run seed.

API overview

All responses use { "success": true, "data": ... } or { "success": false, "message": "..." }. Every POST, PUT, PATCH and DELETE request must include the header X-Requested-With: PlaceMate.

Area Endpoints Auth POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me Public GET /api/stats, GET /api/companies, GET /api/companies/:slug, GET /api/questions, GET /api/questions/filters, GET /api/questions/:id Progress POST /api/progress, DELETE /api/progress/:questionId Bookmarks GET, POST /api/bookmarks, DELETE /api/bookmarks/:questionId Notes GET, PUT, DELETE /api/notes/:questionId Dashboard and reports GET /api/dashboard, POST /api/reports Admin GET /api/admin/stats, GET /api/admin/reports, PATCH /api/admin/reports/:id, PATCH /api/admin/questions/:id

See API.md for request bodies, query parameters and status codes.

Security Passwords are hashed with bcrypt. Plain-text passwords are never stored. The session cookie is HttpOnly, SameSite Lax, and Secure in production. The role is never read from a request, so users cannot make themselves admin. Helmet security headers, request size limits, and rate limiting (stricter on login and registration). express-mongo-sanitize and string type checks against NoSQL injection. State-changing API calls need a custom header that only this site's JavaScript sends (CSRF defence). Page content is built with textContent, which prevents stored text from running as HTML (XSS). Progress, bookmarks and notes are always queried by the logged-in user's id from the session. Secrets live in .env, which is git-ignored. Deployment

Example using Render (Railway works the same way):

Push the repository to GitHub. Create a new Web Service from the repository. Build command: npm install. Start command: npm start. Add the environment variables from the table above, with NODE_ENV=production and your Atlas MONGODB_URI. In Atlas, allow the host's IP address. If the host has no fixed IP, allow 0.0.0.0/0 and use a strong database password. Run npm run seed once against the production database, from your computer with the production MONGODB_URI. Troubleshooting Problem Likely cause and fix Site says "connection refused" The server is not running. Run npm run dev and keep the terminal open. MONGODB_URI is missing .env does not exist or is in the wrong folder. It must sit next to package.json. Could not connect to any servers Your IP is not allowed in Atlas under Network Access. querySrv ECONNREFUSED Your network blocks the DNS lookup used by mongodb+srv:// addresses. Either add require('dns').setServers(['8.8.8.8', '1.1.1.1']); at the very top of src/server.js and scripts/seed.js, or use Atlas's long mongodb:// connection string instead. bad auth or Authentication failed Wrong database username or password. URL-encode special characters in the password. Site loads but has no companies The seed has not been run. Run npm run seed. EADDRINUSE Port 5000 is in use. Set PORT=5001 in .env. PowerShell says scripts are disabled Use npm.cmd instead of npm. Known limitations Only four companies are covered so far. Google, Adobe, Atlassian, Accenture and others are not yet researched. No question is Source-verified, because no official company page was reviewed for questions. Sources are mostly candidate accounts and anonymous reviews, which can be incomplete or outdated. Source dates are the page's last-updated date, not the interview date. No community experience submission, email password reset, or goal setting yet. Companies and questions are added through the dataset script and seed, not an admin screen. Roadmap Research more companies and add official sources where available. Community experience submission with admin approval. Admin interface for adding and editing companies and questions. Email-based password reset and personal preparation goals. Timed mock tests. Author

Nehal Mishra | Bennett university

GitHub: https://github.com/nehalmishra13-beep Email: nehalmishra13@gmail.com Acknowledgements and sources

Question wording in this project is original. Interview details were gathered from public pages, including GeeksforGeeks interview experiences, Glassdoor reviews and a third-party TCS summary. The exact page behind each question is linked on that question's page and stored in data/research/dataset.json. All trademarks belong to their owners, and this project is not affiliated with any company listed.

License

MIT
