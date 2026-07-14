const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/wtwr_db';

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    const server = app.listen(PORT, () => {
      process.stdout.write(`Server running on http://localhost:${PORT}\n`);
    });

    const shutdown = (signal) => {
      process.stdout.write(`Received ${signal}. Shutting down.\n`);
      server.close(() => {
        mongoose.connection.close(false).then(() => process.exit(0));
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  })
  .catch((err) => {
    process.stderr.write(`MongoDB connection error: ${err.message}\n`);
    process.exit(1);
  });
