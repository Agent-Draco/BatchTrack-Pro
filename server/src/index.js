const express = require('express');
const cors = require('cors');
const store = require('./services/store');
const averoStore = require('./services/avero/averoStore');
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
  await averoStore.seed();
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`[BatchTrack] Server running on port ${PORT} with segregated Trackly & Avero subsystems`);
    });
  }
}

boot();

module.exports = app;
