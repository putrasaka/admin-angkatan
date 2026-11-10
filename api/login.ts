import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { createHash, timingSafeEqual } from 'node:crypto';
import { rateLimit, rateLimitKey } from '../server/rate-limit';
import { createAdminSession } from '../server/admin-session';

// POST /api/login — verifikasi kredensial admin di server, balas sesi
// bertanda tangan yang berlaku 8 jam.

function sameValue(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_TOKEN;
  const connectionString = process.env.DATABASE_URL;
  if (!envUser || !envPass || !secret || !connectionString) {
    return res.status(500).json({ error: 'Server belum dikonfigurasi' });
  }

  let body: any;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    return res.status(400).json({ error: 'Body tidak valid' });
  }

  try {
    const sql = neon(connectionString);
    const limited = await rateLimit(sql, rateLimitKey(req, 'login', secret), 10, 900);
    if (!limited.allowed) {
      res.setHeader('Retry-After', String(limited.retryAfter));
      return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
    }

    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '');

    if (!sameValue(username, envUser) || !sameValue(password, envPass)) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    return res.status(200).json({ token: createAdminSession(secret) });
  } catch (err) {
    console.error('[api/login]', err);
    return res.status(500).json({ error: 'Gagal memproses permintaan' });
  }
}
