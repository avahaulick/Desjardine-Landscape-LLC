const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');

const PORT = Number(process.env.PORT || 3002);
const DATABASE_URL = process.env.DATABASE_URL;

const startServer = () => {
  const server = app.listen(PORT, () => {
    process.stdout.write(`Server running on http://localhost:${PORT}\n`);
  });

  const shutdown = (signal) => {
    process.stdout.write(`Received ${signal}. Shutting down.\n`);
    server.close(() => {
      if (mongoose.connection.readyState !== 0) {
        mongoose.connection.close(false).then(() => process.exit(0));
        return;
      }

      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

if (!DATABASE_URL) {
  process.stdout.write('DATABASE_URL is not set. Starting without database-backed routes.\n');
  startServer();
} else {
  mongoose
    .connect(DATABASE_URL)
    .then(() => {
      startServer();
    })
    .catch((err) => {
      process.stderr.write(`MongoDB connection error: ${err.message}\n`);
      process.exit(1);
    });
}
