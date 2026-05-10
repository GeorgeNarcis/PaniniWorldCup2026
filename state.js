import { put, head } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Collection ID from query param, default fallback for legacy
  const col = req.query.col || 'adrenalyn-wc2026';
  const BLOB_KEY = `panini-collection-${col}.json`;

  if (req.method === 'GET') {
    try {
      const blobMeta = await head(BLOB_KEY).catch(() => null);
      if (!blobMeta) return res.status(200).json({});
      const response = await fetch(blobMeta.downloadUrl);
      if (!response.ok) throw new Error('Failed to fetch blob');
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      console.error('GET error:', err);
      return res.status(500).json({ error: 'Failed to load state', detail: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid body' });
      const blob = await put(BLOB_KEY, JSON.stringify(body), {
        access: 'public',
        allowOverwrite: true,
        contentType: 'application/json',
      });
      return res.status(200).json({ ok: true, url: blob.url });
    } catch (err) {
      console.error('POST error:', err);
      return res.status(500).json({ error: 'Failed to save state', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
