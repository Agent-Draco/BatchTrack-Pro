require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/apiRouter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});
