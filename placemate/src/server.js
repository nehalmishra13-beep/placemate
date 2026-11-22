const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const connectDB = require('./config/db');
const createApp = require('./app');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

connectDB(uri)
  .then(() => {
    const port = process.env.PORT || 5000;
    createApp(uri).listen(port, () => console.log(`PlaceMate running at http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    console.error('If you use Atlas, add your current IP under Network Access.');
    process.exit(1);
  });
