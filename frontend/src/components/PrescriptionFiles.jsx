import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { errorText } from '../hooks/useAmbulanceData';
import { FileText, Image as ImageIcon, Upload, Trash2, ExternalLink, Loader2 } from 'lucide-react';

// Prescription papers (PDF or picture) for one appointment.
// The doctor can upload and remove them (canEdit); the patient can open them.

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp';

const sizeText = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const PrescriptionFiles = ({ appointmentId, canEdit = false, compact = false }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/appointments/${appointmentId}/prescription-files`);
      setFiles(data.files || []);
    } catch (err) {
      setError(errorText(err, 'Unable to load the prescription files.'));
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => { setLoading(true); setError(''); load(); }, [load]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (file.size > MAX_BYTES) { setError('The file is too large. The limit is 5 MB.'); return; }
    setBusy(true);
    try {
      const { data } = await api.post(`/appointments/${appointmentId}/prescription-files`, file, {
        headers: { 'Content-Type': 'application/octet-stream' },
        params: { filename: file.name },
        timeout: 60000,
      });
      setFiles(data.files || []);
    } catch (err) {
      setError(errorText(err, 'Unable to upload the file.'));
    } finally {
      setBusy(false);
    }
  };

  // Files need the sign-in token, so they are fetched and shown from a temporary local link
  const open = async (file) => {
    setError('');
    const tab = window.open('', '_blank');
    try {
      const { data } = await api.get(`/prescription-files/${file.id}`, { responseType: 'blob', timeout: 60000 });
      const url = URL.createObjectURL(new Blob([data], { type: file.mime }));
      if (tab) tab.location.href = url;
      else window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
    } catch (err) {
      tab?.close();
      setError(errorText(err, 'Unable to open the file.'));
    }
  };

  const remove = async (file) => {
    if (!window.confirm(`Remove "${file.filename}"?`)) return;
    setError('');
    try {
      await api.delete(`/prescription-files/${file.id}`);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err) {
      setError(errorText(err, 'Unable to remove the file.'));
    }
  };

  if (loading) return null;
  if (!canEdit && files.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {!compact && (
        <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
          Prescription papers
        </p>
      )}

      {files.length > 0 && (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: 0, padding: 0, listStyle: 'none' }}>
          {files.map((f) => (
            <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.7rem', borderRadius: '0.7rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              {f.mime === 'application/pdf' ? <FileText size={18} style={{ color: '#dc2626', flexShrink: 0 }} /> : <ImageIcon size={18} style={{ color: '#4f46e5', flexShrink: 0 }} />}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.filename}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{f.mime === 'application/pdf' ? 'PDF' : 'Picture'} · {sizeText(f.size)}</span>
              </span>
              <button type="button" onClick={() => open(f)} aria-label={`Open ${f.filename}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.7rem', borderRadius: '999px', border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4338ca', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                <ExternalLink size={14} /> View
              </button>
              {canEdit && (
                <button type="button" onClick={() => remove(f)} aria-label={`Remove ${f.filename}`} style={{ display: 'flex', padding: '0.4rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div>
          <input ref={inputRef} type="file" accept={ACCEPT} onChange={upload} style={{ display: 'none' }} aria-label="Choose a prescription PDF or picture" />
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 0.95rem', borderRadius: '0.7rem', border: '1.5px dashed #94a3b8', background: '#ffffff', color: '#334155', fontSize: '0.84rem', fontWeight: 700, cursor: busy ? 'wait' : 'pointer' }}>
            {busy ? <Loader2 size={16} /> : <Upload size={16} />} {busy ? 'Uploading...' : 'Upload PDF or picture'}
          </button>
          <p style={{ marginTop: '0.3rem', fontSize: '0.74rem', color: '#64748b' }}>PDF, JPG, PNG or WebP, up to 5 MB each (maximum 5 files).</p>
        </div>
      )}

      {error && <p role="alert" style={{ padding: '0.55rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.82rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}
    </div>
  );
};

export default PrescriptionFiles;
