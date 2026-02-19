require('dotenv').config();
const express = require('express');
const path = require('path');
const healthRouter = require('./routes/health');
const beritaRouter = require('./routes/berita');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/health', healthRouter);
app.use('/api/berita', beritaRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/tulis', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tulis.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

app.listen(PORT, () => {
  console.log(`EduNews berjalan di port ${PORT}`);
});
