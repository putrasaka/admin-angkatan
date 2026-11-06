import type { VercelRequest, VercelResponse } from '@vercel/node';

// POST /api/login — verifikasi kredensial admin di server, balas token.
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  const token = process.env.ADMIN_TOKEN;
  if (!envUser || !envPass || !token) {
    return res.status(500).json({ error: 'ADMIN_USERNAME/ADMIN_PASSWORD/ADMIN_TOKEN belum diset' });
  }

  let body: any;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    return res.status(400).json({ error: 'Body tidak valid' });
  }

  const username = String(body.username ?? '').trim();
  const password = String(body.password ?? '');

  if (username !== envUser || password !== envPass) {
    return res.status(401).json({ error: 'Username atau password salah' });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, token });
}
