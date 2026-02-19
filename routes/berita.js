const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand,
        ScanCommand, GetCommand,
        DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
}));

const TABLE = process.env.DYNAMODB_TABLE;

// GET semua berita
router.get('/', async (req, res) => {
  try {
    const result = await dynamo.send(new ScanCommand({ TableName: TABLE }));
    const items = (result.Items || []).sort((a, b) =>
      new Date(b.tanggal) - new Date(a.tanggal)
    );
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET satu berita by id
router.get('/:id', async (req, res) => {
  try {
    const result = await dynamo.send(new GetCommand({
      TableName: TABLE,
      Key: { id: req.params.id }
    }));
    if (!result.Item) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }
    res.json({ success: true, data: result.Item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST buat berita baru
router.post('/', async (req, res) => {
  try {
    const { judul, kategori, penulis, sekolah, isi, gambar_url } = req.body;
    if (!judul || !kategori || !isi) {
      return res.status(400).json({
        success: false,
        message: 'Judul, kategori, dan isi wajib diisi'
      });
    }
    const berita = {
      id: uuidv4(),
      judul,
      kategori,
      penulis: penulis || 'Redaksi',
      sekolah: sekolah || '',
      isi,
      gambar_url: gambar_url || '',
      tanggal: new Date().toISOString(),
      views: 0
    };
    await dynamo.send(new PutCommand({ TableName: TABLE, Item: berita }));
    res.status(201).json({ success: true, message: 'Berita berhasil dipublikasikan', id: berita.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE hapus berita
router.delete('/:id', async (req, res) => {
  try {
    await dynamo.send(new DeleteCommand({
      TableName: TABLE,
      Key: { id: req.params.id }
    }));
    res.json({ success: true, message: 'Berita berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
