require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { sequelize } = require('./config/db');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./utils/errors');
const rateLimiter = require('./middleware/rateLimiter');


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 4000;
async function start() {
  // Note: in production you typically run migrations instead.
  await sequelize.authenticate();

  if (process.env.SEQUELIZE_SYNC === 'true') {
    await sequelize.sync({ alter: true });
  }

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

