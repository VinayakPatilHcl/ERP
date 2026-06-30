import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Image as ImageIcon, Receipt, Stethoscope, Trash2, Upload } from 'lucide-react';
import api from '../api/client';

interface ClinicSettings {
  id?: number;
  clinicName: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  defaultGstPercent?: number;
  currency?: string;
  invoicePrefix?: string;
  prescriptionFooter?: string;
  registration?: string;
  logoUrl?: string;
  letterheadTagline?: string;
  invoiceFooter?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization?: string;
  qualification?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  consultationFee?: number;
  active?: boolean;
}

const emptyDoctor: Omit<Doctor, 'id'> = {
  name: '',
  specialization: '',
  qualification: '',
  registrationNumber: '',
  phone: '',
  email: '',
  consultationFee: 0,
  active: true,
};

function initials(s?: string) {
  if (!s) return '·';
  return s
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function SettingsPage() {
  const [s, setS] = useState<ClinicSettings | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doc, setDoc] = useState<Omit<Doctor, 'id'>>(emptyDoctor);
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const loadDoctors = () => api.get('/doctors').then((r) => setDoctors(r.data));

  useEffect(() => {
    api.get('/settings/clinic').then((r) => setS(r.data));
    loadDoctors();
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!s) return;
    setSaving(true);
    try {
      const r = await api.put('/settings/clinic', s);
      setS(r.data);
      toast.success('Settings saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addDoctor = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/doctors', doc);
      setDoc(emptyDoctor);
      loadDoctors();
      toast.success('Doctor added');
    } catch {
      toast.error('Failed to add doctor');
    }
  };

  const onLogoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !s) return;
    if (file.size > 512 * 1024) {
      toast.error('Logo must be under 500 KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setS({ ...s, logoUrl: dataUrl });
      toast.success('Logo loaded — remember to save');
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => s && setS({ ...s, logoUrl: '' });

  if (!s) return <div className="card">Loading settings…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 style={{ margin: 0 }}>Settings</h1>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Clinic identity, letterhead, and team — used across prescriptions and invoices.
          </div>
        </div>
      </div>

      <form className="card" onSubmit={save}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={16} /> Clinic identity
        </h3>

        <div className="logo-picker" style={{ marginBottom: 14 }}>
          <div className={`logo-preview ${s.logoUrl ? 'has-img' : ''}`}>
            {s.logoUrl
              ? <img src={s.logoUrl} alt="Clinic logo" />
              : <span>{initials(s.clinicName)}</span>}
          </div>
          <div className="logo-actions">
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="secondary" onClick={() => logoInputRef.current?.click()}>
                <Upload size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                {s.logoUrl ? 'Replace logo' : 'Upload logo'}
              </button>
              {s.logoUrl && (
                <button type="button" className="secondary" onClick={clearLogo}>
                  <Trash2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                  Remove
                </button>
              )}
            </div>
            <div className="hint">PNG/JPG/SVG, square works best. Stored inline; keep under 500 KB.</div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={onLogoFile}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="settings-grid">
          <div>
            <label>Clinic Name *</label>
            <input required value={s.clinicName || ''} onChange={(e) => setS({ ...s, clinicName: e.target.value })} />
          </div>
          <div>
            <label>Registration / Council #</label>
            <input value={s.registration || ''} onChange={(e) => setS({ ...s, registration: e.target.value })} placeholder="e.g. KMC-12345" />
          </div>
          <div>
            <label>Phone</label>
            <input value={s.phone || ''} onChange={(e) => setS({ ...s, phone: e.target.value })} />
          </div>
          <div>
            <label>Email</label>
            <input value={s.email || ''} onChange={(e) => setS({ ...s, email: e.target.value })} />
          </div>
          <div className="full">
            <label>Address</label>
            <input value={s.address || ''} onChange={(e) => setS({ ...s, address: e.target.value })} />
          </div>
          <div className="full">
            <label>Letterhead Tagline</label>
            <input
              value={s.letterheadTagline || ''}
              onChange={(e) => setS({ ...s, letterheadTagline: e.target.value })}
              placeholder="e.g. Holistic Care · Ayurveda & Wellness"
            />
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
              Small uppercase line under the clinic name on prescriptions & invoices.
            </div>
          </div>
        </div>
      </form>

      <form className="card" onSubmit={save}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Receipt size={16} /> Tax & invoicing
        </h3>
        <div className="settings-grid">
          <div>
            <label>GSTIN</label>
            <input value={s.gstin || ''} onChange={(e) => setS({ ...s, gstin: e.target.value })} />
          </div>
          <div>
            <label>Default GST %</label>
            <input type="number" step="0.01" value={s.defaultGstPercent ?? 0} onChange={(e) => setS({ ...s, defaultGstPercent: Number(e.target.value) })} />
          </div>
          <div>
            <label>Currency</label>
            <input value={s.currency || 'INR'} onChange={(e) => setS({ ...s, currency: e.target.value })} />
          </div>
          <div>
            <label>Invoice Prefix</label>
            <input value={s.invoicePrefix || 'INV'} onChange={(e) => setS({ ...s, invoicePrefix: e.target.value })} />
          </div>
          <div className="full">
            <label>Invoice Footer</label>
            <textarea
              rows={2}
              value={s.invoiceFooter || ''}
              onChange={(e) => setS({ ...s, invoiceFooter: e.target.value })}
              placeholder="e.g. Thank you for choosing us. Cheques payable to ‘Clinic Name’."
            />
          </div>
          <div className="full">
            <label>Prescription Footer</label>
            <textarea
              rows={2}
              value={s.prescriptionFooter || ''}
              onChange={(e) => setS({ ...s, prescriptionFooter: e.target.value })}
              placeholder="e.g. Issued for the named patient only. Complete the full course."
            />
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </form>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stethoscope size={16} /> Doctors
        </h3>
        <table>
          <thead><tr><th>Name</th><th>Specialization</th><th>Reg #</th><th>Fee</th><th>Phone</th></tr></thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.specialization}</td>
                <td>{d.registrationNumber}</td>
                <td>₹{d.consultationFee}</td>
                <td>{d.phone}</td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 14 }}>No doctors yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <form className="card" onSubmit={addDoctor}>
        <h3>Add doctor</h3>
        <div className="grid grid-3">
          <div><label>Name *</label><input required value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value })} /></div>
          <div><label>Specialization</label><input value={doc.specialization} onChange={(e) => setDoc({ ...doc, specialization: e.target.value })} /></div>
          <div><label>Qualification</label><input value={doc.qualification} onChange={(e) => setDoc({ ...doc, qualification: e.target.value })} /></div>
          <div><label>Reg. Number</label><input value={doc.registrationNumber} onChange={(e) => setDoc({ ...doc, registrationNumber: e.target.value })} /></div>
          <div><label>Phone</label><input value={doc.phone} onChange={(e) => setDoc({ ...doc, phone: e.target.value })} /></div>
          <div><label>Consultation Fee</label><input type="number" step="0.01" value={doc.consultationFee} onChange={(e) => setDoc({ ...doc, consultationFee: Number(e.target.value) })} /></div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit">Add doctor</button>
        </div>
      </form>
    </div>
  );
}
