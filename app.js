const express = require('express');
const morgan = require('morgan');

const warrantyRouter = require('./routes/warrantyRoutes');
const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/warrantys', warrantyRouter);

module.exports = app;
