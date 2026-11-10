import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { verifyAdminSession } from '../server/admin-session';

// Endpoint CRUD admin. Semua request wajib header: Authorization: Bearer <ADMIN_TOKEN>
const COLUMNS: Record<string, string[]> = {
  students: ['id', 'name', 'nickname', 'role', 'photo', 'photo_large', 'photo_sd', 'photo_smp', 'previous_school', 'current_school', 'birth_place_date', 'address', 'hobby', 'dream', 'message', 'impression', 'instagram', 'created_at'],
  moments: ['id', 'title', 'image', 'date', 'tag', 'story', 'created_at'],
  graduation_info: ['id', 'main_banner', 'title', 'cohort_name', 'date', 'location', 'description'],
  graduates: ['id', 'name', 'position'],
  graduation_gallery: ['id', 'image', 'caption', 'created_at'],
  video_moments: ['id', 'title', 'description', 'video_url', 'poster_url', 'duration', 'date', 'created_at'],
  visitor_logs: ['id', 'name', 'age', 'previous_school', 'current_school', 'logged_in_at'],
  feedback: ['id', 'visitor_name', 'phone', 'message', 'created_at'],
};

const INSERTABLE = new Set(['students', 'moments', 'graduation_gallery', 'video_moments', 'graduates']);
const UPDATABLE = new Set(['students', 'moments', 'graduation_gallery', 'video_moments', 'graduation_info']);

type Row = Record<string, unknown>;

// Nilai yang sudah berupa URL media tidak boleh ditulis balik ke DB:
// kolomnya menyimpan base64, dan menulis URL akan membuat endpoint media loop.
function isMediaRef(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith('/api/media?');
}

function authorized(req: VercelRequest): boolean {
  return verifyAdminSession(req.headers.authorization, process.env.ADMIN_TOKEN);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: 'Server belum dikonfigurasi' });
  }
  if (!authorized(req)) {
    return res.status(401).json({ error: 'Tidak berwenang' });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'Server belum dikonfigurasi' });
  }

  const sql = neon(connectionString);

  try {
    if (req.method === 'GET') {
      const table = String(req.query.table ?? '');
      const limitRaw = Number(req.query.limit ?? 100);
      const limit = Math.min(
        Math.max(Number.isFinite(limitRaw) ? Math.trunc(limitRaw) : 100, 1),
        200
      );
      const offsetRaw = Number(req.query.offset ?? 0);
      const offset = Math.max(Number.isFinite(offsetRaw) ? Math.trunc(offsetRaw) : 0, 0);

      if (table === 'visitor_logs') {
        const rows = await sql.query(
          'select * from visitor_logs order by logged_in_at desc limit $1 offset $2',
          [limit, offset]
        );
        return res.status(200).json(rows);
      }
      if (table === 'feedback') {
        const rows = await sql.query(
          'select * from feedback order by created_at desc limit $1 offset $2',
          [limit, offset]
        );
        return res.status(200).json(rows);
      }
      return res.status(400).json({ error: 'Tabel tidak diizinkan' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let body: any;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    } catch {
      return res.status(400).json({ error: 'Body tidak valid' });
    }

    const table = String(body.table ?? '');
    const op = String(body.op ?? '');
    const columns = COLUMNS[table];
    if (!columns) {
      return res.status(400).json({ error: 'Tabel tidak dikenal' });
    }

    const usableColumns = (row: Row) =>
      Object.keys(row).filter(
        (c) =>
          columns.includes(c) &&
          c !== 'created_at' &&
          c !== 'logged_in_at' &&
          !isMediaRef(row[c])
      );

    if (op === 'insert') {
      if (!INSERTABLE.has(table)) {
        return res.status(400).json({ error: 'Operasi insert tidak diizinkan untuk tabel ini' });
      }
      const row = (body.row ?? {}) as Row;
      const keys = usableColumns(row);
      if (keys.length === 0) {
        return res.status(400).json({ error: 'Tidak ada kolom valid' });
      }
      const values: unknown[] = [];
      const placeholders = keys.map((c) => {
        values.push(row[c] ?? null);
        return `$${values.length}`;
      });
      const query = `insert into ${table} (${keys.map((c) => `"${c}"`).join(', ')}) values (${placeholders.join(', ')})`;
      await sql.query(query, values);
      return res.status(200).json({ ok: true });
    }

    if (op === 'update') {
      if (!UPDATABLE.has(table)) {
        return res.status(400).json({ error: 'Operasi update tidak diizinkan untuk tabel ini' });
      }
      const id = String(body.id ?? '');
      if (!id) {
        return res.status(400).json({ error: 'id wajib diisi' });
      }
      const row = (body.row ?? {}) as Row;
      const keys = usableColumns(row).filter((c) => c !== 'id');
      if (keys.length === 0) {
        return res.status(400).json({ error: 'Tidak ada kolom valid' });
      }
      const values: unknown[] = [];
      const sets = keys.map((c) => {
        values.push(row[c] ?? null);
        return `"${c}" = $${values.length}`;
      });
      values.push(id);
      await sql.query(
        `update ${table} set ${sets.join(', ')} where id::text = $${values.length}`,
        values
      );
      return res.status(200).json({ ok: true });
    }

    if (op === 'delete') {
      const id = String(body.id ?? '');
      if (!id) {
        return res.status(400).json({ error: 'id wajib diisi' });
      }
      await sql.query(`delete from ${table} where id::text = $1`, [id]);
      return res.status(200).json({ ok: true });
    }

    if (op === 'replace') {
      if (table !== 'graduates') {
        return res.status(400).json({ error: 'Operasi replace hanya untuk graduates' });
      }
      const rows = Array.isArray(body.rows) ? (body.rows as Row[]) : [];
      if (rows.length === 0) {
        await sql.query('delete from graduates');
        return res.status(200).json({ ok: true });
      }
      const values: unknown[] = [];
      const tuples = rows.map((r) => {
        values.push(String(r.name ?? ''), Number(r.position ?? 0));
        return `($${values.length - 1}, $${values.length})`;
      });
      // Satu statement atomik: hapus lalu isi ulang daftar wisudawan.
      const query = `with del as (delete from graduates returning 1)
        insert into graduates (name, position) values ${tuples.join(', ')}`;
      await sql.query(query, values);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Operasi tidak dikenal' });
  } catch (err) {
    console.error('[api/admin]', err);
    return res.status(500).json({ error: 'Gagal memproses permintaan' });
  }
}
