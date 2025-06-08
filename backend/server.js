const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api', routes);

// For any other route, serve index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
