const express = require('express');
const cors = require('cors');
const store = require('./services/store');
const apiRouter = require('./routes/apiRouter');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.use(errorHandler);

async function boot() {
  await store.seed();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

boot();

module.exports = app;
