require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimit({ windowMs: 60*1000, max: 120 }));

app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);

// serve frontend files (optional)
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'home.html')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
