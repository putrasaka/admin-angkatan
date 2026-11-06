import React, { useCallback, useEffect, useState } from 'react';
import { useDataStore } from '../../context/DataContext';
import { authFetch } from '../../lib/api';
import { Trash2, Loader2 } from 'lucide-react';

interface VisitorLog {
  id: string;
  name: string;
  age: string;
  previous_school: string;
  current_school: string;
  logged_in_at: string;
}

export const ManageVisitorsTab: React.FC = () => {
  const { showToast, isApiConfigured } = useDataStore();
  const [rows, setRows] = useState<VisitorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isApiConfigured) {
      setRows([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin?table=visitor_logs');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast((err as Error).message, 'error');
      setRows([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiConfigured]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (row: VisitorLog) => {
    if (!window.confirm(`Yakin ingin menghapus log pengunjung "${row.name}"?`)) return;
    try {
      await authFetch('/api/admin', {
        method: 'POST',
        body: JSON.stringify({ table: 'visitor_logs', op: 'delete', id: row.id }),
      });
      showToast(`Log "${row.name}" dihapus.`, 'info');
      load();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#4B4038]">
        <h3 className="text-xl font-extrabold text-[#CAAA98]">Pengunjung</h3>
        <p className="text-xs text-[#9A8678] mt-0.5">
          Riwayat login pengunjung buku kenangan (tabel <span className="font-mono">visitor_logs</span>), terbaru di atas.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-8 text-center bg-[#202940]/50 border border-dashed border-[#4B4038] rounded-2xl text-xs text-[#9A8678] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat data pengunjung...</span>
        </div>
      )}

      {/* Unconfigured */}
      {!isLoading && !isApiConfigured && (
        <div className="p-8 text-center bg-[#202940]/50 border border-dashed border-[#4B4038] rounded-2xl text-xs text-[#9A8678]">
          API belum terhubung. Data pengunjung tidak tersedia.
        </div>
      )}

      {/* Table */}
      {!isLoading && isApiConfigured && rows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-[#4B4038]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#4B4038]/60 text-[#CAAA98] font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3 whitespace-nowrap">Waktu Login</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Umur</th>
                <th className="px-4 py-3">Sekolah SD</th>
                <th className="px-4 py-3">Sekolah Sekarang</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[#4B4038] text-[#9A8678] hover:bg-[#4B4038]/30 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-[#CAAA98] font-medium">
                    {formatTime(row.logged_in_at)}
                  </td>
                  <td className="px-4 py-3 text-white font-semibold">{row.name || '-'}</td>
                  <td className="px-4 py-3">{row.age || '-'}</td>
                  <td className="px-4 py-3">{row.previous_school || '-'}</td>
                  <td className="px-4 py-3">{row.current_school || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/80 text-red-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty */}
      {!isLoading && isApiConfigured && rows.length === 0 && (
        <div className="p-8 text-center bg-[#202940]/50 border border-dashed border-[#4B4038] rounded-2xl text-xs text-[#9A8678]">
          Belum ada log pengunjung.
        </div>
      )}
    </div>
  );
};
